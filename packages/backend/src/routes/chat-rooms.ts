// import Schema from 'schemastery'
import { Router } from '@boiling/core'
import { ChatRoomsService } from '../services/chat-rooms'

export const router = new Router({
  prefix: '/chat-rooms' as '/chat-rooms'
})
  .post('/:chatRoomId/messages', async ctx => {
    const [ createAt, senderId, ...receiverIds ] = ctx.params.chatRoomId.split(':').slice(0, -1)
    const { content } = ctx.request.body
    await ChatRoomsService.pushMessage(+senderId, {
      content: content,
      createdAt: createAt.slice(1, -1),
      chatRoomId: ctx.params.chatRoomId
    }, receiverIds.map(id => +id))
  })
