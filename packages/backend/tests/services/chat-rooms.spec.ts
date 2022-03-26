import { expect, use } from 'chai'
import cap from 'chai-as-promised'
import { Users } from '@boiling/core'
import { UsersService } from '../../src/services/users'
import { ChatRoomsService } from '../../src/services/chat-rooms'

use(cap)

after(() => {
  process.exit(0)
})
describe('ChatRooms Service', () => {
  let sender: Users.Base, receiver: Users.Base
  after(async () => {
    await UsersService.Model.deleteMany({})
  })
  before(async () => {
    sender = await UsersService.add({ username: 'sender', passwordHash: 'sender', avatar: 'sender' })
    receiver = await UsersService.add({ username: 'receiver', passwordHash: 'receiver', avatar: 'receiver' })
  })

  afterEach(async () => {
    await ChatRoomsService.Model.deleteMany({})
    await ChatRoomsService.Message.Model.deleteMany({})
  })
  it('should create a chat room.', async () => {
    const { id } = await ChatRoomsService.create([sender.id, receiver.id])
    const charRoom = await ChatRoomsService.get(id)
    expect(charRoom?.name).to.equal(undefined)
    expect(charRoom?.avatar).to.equal(undefined)

    await expect(
      ChatRoomsService.create([sender.id, receiver.id]),
      'throw a `CONFLICT` error'
    ).to.be.eventually.rejectedWith(`[409] members 为 [${sender.id}, ${receiver.id}] 的聊天室已存在`)
    await expect(
      ChatRoomsService.create([123, receiver.id]),
      'throw `NOT_FOUND` error'
    ).to.be.eventually.rejectedWith('[404] members 中存在不存在的用户')
  })
  it('should get chat room by members or id.', async () => {
    const members = [sender.id, receiver.id]
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
    const members = [sender.id, receiver.id]
    const { id } = await ChatRoomsService.create(members)
    await expect(ChatRoomsService.exists(id))
      .to.eventually.equal(true)
    await expect(ChatRoomsService.exists(members))
      .to.eventually.equal(true)
    await expect(ChatRoomsService.exists([123, receiver.id]))
      .to.eventually.equal(false)
    await expect(ChatRoomsService.exists('623f1b13e11111f3c2debd48'))
      .to.eventually.equal(false)
  })
  describe('Message', function () {
    it('should push message to target chat room.', async () => {
      const { id } = await ChatRoomsService.create([sender.id, receiver.id])
      const m = await ChatRoomsService.Message.create(id, sender.id, 'hello')
      expect(m.content).to.equal('hello')
      expect(m.sender.username).to.equal(sender.username)
      await expect(
        ChatRoomsService.Message.create('623f1b13e11111f3c2debd48', sender.id, 'hello'),
        'throw `NOT_FOUND` error'
      ).to.be.eventually.rejectedWith('[404] id 为 \'623f1b13e11111f3c2debd48\' 的聊天室不存在')
      for (const msg in ['hi', 'hello', 'world']) {
        await ChatRoomsService.Message.create(id, sender.id, msg)
      }
    })
  })
})
