import { expect, use } from 'chai'
import cap from 'chai-as-promised'
import * as MockDate from 'mockdate'
import { Messages, Users } from '@boiling/core'
import { UsersService } from '../../src/services/users'
import { ChatRoomsService } from '../../src/services/chat-rooms'

use(cap)

after(() => {
  process.exit(0)
})
describe('ChatRooms Service', () => {
  let u0: Users.Base, u1: Users.Base
  after(async () => {
    await UsersService.Model.deleteMany({})
  })
  before(async () => {
    u0 = await UsersService.add({ username: 'sender', passwordHash: 'sender', avatar: 'sender' })
    u1 = await UsersService.add({ username: 'receiver', passwordHash: 'receiver', avatar: 'receiver' })
  })

  afterEach(async () => {
    await ChatRoomsService.Model.deleteMany({})
    await ChatRoomsService.Message.Model.deleteMany({})
  })
  it('should create a chat room.', async () => {
    const { id } = await ChatRoomsService.create([u0.id, u1.id])
    const charRoom = await ChatRoomsService.get(id)
    expect(charRoom?.name).to.equal(undefined)
    expect(charRoom?.avatar).to.equal(undefined)

    await expect(
      ChatRoomsService.create([u0.id, u1.id]),
      'throw a `CONFLICT` error'
    ).to.be.eventually.rejectedWith(`[409] members 为 [${u0.id}, ${u1.id}] 的聊天室已存在`)
    await expect(
      ChatRoomsService.create([123, u1.id]),
      'throw `NOT_FOUND` error'
    ).to.be.eventually.rejectedWith('[404] members 中存在不存在的用户')
  })
  it('should get chat room by members or id.', async () => {
    const members = [u0.id, u1.id]
    const { id } = await ChatRoomsService.create(members)
    await expect(ChatRoomsService.get(id))
      .to.be.eventually.have.property('id', id)
    await expect(ChatRoomsService.get(members))
      .to.be.eventually.have.property('id', id)
    await expect(ChatRoomsService.get(members.reverse()))
      .to.be.eventually.have.property('id', id)
    await expect(ChatRoomsService.getOrThrow(members.concat(123)))
      .to.be.eventually.rejectedWith(`[404] members 为 [${ members.concat(123).join(', ') }] 的聊天室不存在`)
    await expect(ChatRoomsService.getOrThrow('623f1b13e11111f3c2debd48'))
      .to.be.eventually.rejectedWith('[404] id 为 \'623f1b13e11111f3c2debd48\' 的聊天室不存在')
  })
  it('should determine whether the chat room exists.', async () => {
    const members = [u0.id, u1.id]
    const { id } = await ChatRoomsService.create(members)
    await expect(ChatRoomsService.exists(id))
      .to.be.eventually.equal(true)
    await expect(ChatRoomsService.exists(members))
      .to.be.eventually.equal(true)
    await expect(ChatRoomsService.exists([123, u1.id]))
      .to.be.eventually.equal(false)
    await expect(ChatRoomsService.exists('623f1b13e11111f3c2debd48'))
      .to.be.eventually.equal(false)
  })
  it('should delete chat room by id.', async () => {
    const members = [u0.id, u1.id]
    const { id } = await ChatRoomsService.create(members)
    await ChatRoomsService.del(id)
    await expect(ChatRoomsService.get(id))
      .to.be.eventually.equal(null)
    await expect(ChatRoomsService.del('623f1b13e11111f3c2debd48'))
      .to.be.eventually.be.rejectedWith('[404] id 为 \'623f1b13e11111f3c2debd48\' 的聊天室不存在')
  })
  describe('Message', function () {
    it('should push message to target chat room.', async () => {
      const { id } = await ChatRoomsService.create([u0.id, u1.id])
      const m = await ChatRoomsService.Message.create(id, u0.id, 'hello')
      expect(m.content).to.equal('hello')
      expect(m.sender.username).to.equal(u0.username)
      await expect(
        ChatRoomsService.Message.create('623f1b13e11111f3c2debd48', u0.id, 'hello'),
        'throw `NOT_FOUND` error'
      ).to.be.eventually.rejectedWith('[404] id 为 \'623f1b13e11111f3c2debd48\' 的聊天室不存在')
      for (const msg in ['hi', 'hello', 'world']) {
        await ChatRoomsService.Message.create(id, u0.id, msg)
      }
    })
    it('should search messages.', async () => {
      const { id } = await ChatRoomsService.create([u0.id, u1.id])
      const periods: [number, string][] = [
        [11, '2000-06-01T03:24:00.000Z'],
        [14, '2000-06-01T03:24:44.000Z'],
        [27, '2000-06-01T03:25:01.000Z'],
        [31, '2000-06-01T03:26:00.000Z'],
        [42, '2000-06-01T03:26:12.000Z'],
        [50, '2000-06-01T03:26:15.000Z']
      ]
      const messages: Messages.Model[] = []
      const asyncFuncArr = [...Array(50).keys()].map(i =>
        () => ChatRoomsService.Message.create(id, i % 4 ? u0.id : u1.id, `hello ${i}`)
      )
      let prevI = 0
      for (const period in periods) {
        const [i, time] = periods[period]
        MockDate.set(time)
        messages.push(
          ...(await Promise.all(asyncFuncArr.slice(prevI, i).map(f => f())))
        )
        prevI = i
      }
      await expect(ChatRoomsService.Message.search(id))
        .to.be.eventually.have.lengthOf(messages.length)
      await expect(
        ChatRoomsService.Message.search(id, {
          period: [undefined, new Date(periods[1][1])]
        })
      ).to.be.eventually.have.lengthOf(periods[1][0])
      await expect(
        ChatRoomsService.Message.search(id, {
          period: [new Date(periods[1][1]), undefined]
        })
      ).to.be.eventually.have.lengthOf(messages.length - periods[0][0])
      await expect(
        ChatRoomsService.Message.search(id, {
          period: [new Date(periods[1][1]), new Date(periods[2][1])]
        })
      ).to.be.eventually.have.lengthOf(periods[2][0] - periods[0][0])
      await expect(
        ChatRoomsService.Message.search(id, { senderId: u0.id })
      ).to.be.eventually.have.lengthOf(messages.filter(m => m.sender.id === u0.id).length)
      await expect(
        ChatRoomsService.Message.search(id, { senderId: u1.id })
      ).to.be.eventually.have.lengthOf(messages.filter(m => m.sender.id === u1.id).length)
      await expect(
        ChatRoomsService.Message.search(id, {
          senderId: u0.id,
          period: [new Date(periods[1][1]), new Date(periods[2][1])]
        })
      ).to.be.eventually.have.lengthOf((periods[2][0] - periods[0][0]) * 0.75)
      await expect(
        ChatRoomsService.Message.search('623f1b13e11111f3c2debd48')
      ).to.be.eventually.have.lengthOf(0)
    })
  })
})
