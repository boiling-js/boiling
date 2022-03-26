import { expect, use } from 'chai'
import cap from 'chai-as-promised'
import { ChatRoomsService } from '../../src/services/chat-rooms'
import { UsersService } from '../../src/services/users'
import { Users } from '@boiling/core'

use(cap)

after(() => {
  process.exit(0)
})
describe('ChatRooms Service', () => {
  let sender: Users.Base, receiver: Users.Base
  afterEach(async () => {
    await ChatRoomsService.Model.deleteMany({})
    await ChatRoomsService.Message.Model.deleteMany({})
    await UsersService.Model.deleteMany({})
  })
  before(async () => {
    sender = await UsersService.add({ username: 'sender', passwordHash: 'sender', avatar: 'sender' })
    receiver = await UsersService.add({ username: 'receiver', passwordHash: 'receiver', avatar: 'receiver' })
  })
  it('should create a chatRoom.', async () => {
    const { id } = await ChatRoomsService.create([sender.id, receiver.id])
    const charRoom = await ChatRoomsService.get(id)
    expect(charRoom?.name).to.equal(undefined)
    expect(charRoom?.avatar).to.equal(undefined)
  })
  it('should throw a `CONFLICT` error when create a exit chatRoom ', async () => {
    await ChatRoomsService.create([sender.id, receiver.id])
    await ChatRoomsService.create([sender.id, receiver.id]).catch(e => {
      if (e instanceof HttpError) {
        expect(e.code).to.equal(409)
        expect(e.msg).to.equal(`members 为 [${sender.id}, ${receiver.id}] 的聊天室已存在`)
      }
    })
  })
  it('should throw `NOT_FOUND` error when create a chatRoom and do not exit the user', async () => {
    await ChatRoomsService.create([123, receiver.id]).catch(e => {
      if (e instanceof HttpError) {
        expect(e.code).to.equal(404)
        expect(e.msg).to.equal('id 为123的用户不存在')
      }
    })
  })
  it('should push message to target chat room.', async () => {
    const { id } = await ChatRoomsService.create([sender.id, receiver.id])
    const m = await ChatRoomsService.Message.create(id, sender.id, 'hello')
    console.log('m', m)
  })
})
