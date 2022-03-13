// import Schema from 'schemastery'
import { Router } from '@boiling/core'
import { ChatRoomsService } from '../services/chat-rooms'
import { clients } from './ws'

export const router = new Router({
  prefix: '/chat-rooms' as '/chat-rooms'
})
  .post('/:chatRoomId/messages', async ctx => {
    const [ createAt, senderId, ...receiverIds ] = ctx.params.chatRoomId.split(':').slice(0, -1)
    const receiverArr = receiverIds.map(id => +id)
    const { content } = ctx.request.body
    const message = await ChatRoomsService.pushMessage(+senderId, {
      content: content,
      createdAt: createAt.slice(1, -1),
      chatRoomId: ctx.params.chatRoomId
    }, receiverArr)
    receiverArr.forEach(id => {
      const client = clients.get(id)
      if (client) {
        client.dispatch('MESSAGE', message)
      }
    })
  })
