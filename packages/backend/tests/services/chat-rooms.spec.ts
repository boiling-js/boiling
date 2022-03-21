import { expect, use } from 'chai'
import cap from 'chai-as-promised'
import { ChatRoomsService } from '../../src/services/chat-rooms'
import { UsersService } from '../../src/services/users'

use(cap)

after(() => {
  process.exit(0)
})
describe('ChatRooms Service', () => {
  afterEach(async () => {
    await ChatRoomsService.Message.Model.deleteMany({})
    await UsersService.Model.deleteMany({})
  })
  it('should push message', async () => {
    const sender = await UsersService.add({ username: 'sender', passwordHash: 'sender', avatar: 'sender' })
    const receiver = await UsersService.add({ username: 'receiver', passwordHash: 'receiver', avatar: 'receiver' })
    const time = (new Date().getTime()).toString()
     const message = await ChatRoomsService.Message.create(sender.id, {
      content:'This is a test message',
      createdAt: time,
      chatRoomId: `[${time}]:${sender.id}:${receiver.id}:`
    }, [receiver.id])
    const sender1 = await UsersService.getOrThrow(sender.id)
    const receive1 = await UsersService.getOrThrow(receiver.id)
    expect(sender1.chatRooms).to.have.lengthOf(1)
    expect(sender1.chatRooms[0]).to.equal(`[${time}]:${sender.id}:${receiver.id}:`)
    expect(receive1.chatRooms).to.have.lengthOf(1)
    expect(receive1.chatRooms[0]).to.equal(`[${time}]:${sender.id}:${receiver.id}:`)
    expect(message.chatRoomId).to.equal(`[${time}]:${sender.id}:${receiver.id}:`)
  })
  it('should get messages by chatRoomId', async () => {
    const sender = await UsersService.add({ username: 'sender', passwordHash: 'sender', avatar: 'sender' })
    const receiver = await UsersService.add({ username: 'receiver', passwordHash: 'receiver', avatar: 'receiver' })
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
