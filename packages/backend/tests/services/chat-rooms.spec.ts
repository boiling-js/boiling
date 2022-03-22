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
  it('should create a chatRoom', async () => {
    const chatRoom = await ChatRoomsService.create([sender.id, receiver.id])
    const charRoom1 = await ChatRoomsService.get(chatRoom.id)
    expect(charRoom1!.id).to.equal(chatRoom.id)
    expect(charRoom1!.name).to.equal(undefined)
    expect(charRoom1!.avatar).to.equal(undefined)
  })

  it('should push message', async () => {
  })
  it('should get messages by chatRoomId', async () => {
    const time = (new Date().getTime()).toString()
    await ChatRoomsService.Message.create(sender.id, {
      content:'123',
      createdAt: time,
      chatRoomId: `[${time}]:${sender.id}:${receiver.id}:`
    }, [receiver.id])
    await ChatRoomsService.Message.create(sender.id, {
      content:'456',
      createdAt: time,
      chatRoomId: `[${time}]:${sender.id}:${receiver.id}:`
    }, [receiver.id])
    const messages = await ChatRoomsService.getMessages(`[${time}]:${sender.id}:${receiver.id}:`)
    expect(messages).to.have.lengthOf(2)
    expect(messages[0].content).to.equal('123')
  })
})
