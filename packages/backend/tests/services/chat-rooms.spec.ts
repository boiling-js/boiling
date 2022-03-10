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
    await ChatRoomsService.Model.deleteMany({})
    await UsersService.Model.deleteMany({})
  })
  it('should push message', async () => {
    const sender = await UsersService.add({ username: 'sender', passwordHash: 'sender', avatar: 'sender' })
    const receiver = await UsersService.add({ username: 'receiver', passwordHash: 'receiver', avatar: 'receiver' })
    const time = (new Date().getTime()).toString()
     const message = await ChatRoomsService.pushMessage(sender.id, {
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
})
