// import Schema from 'schemastery'
import { Router } from '@boiling/core'
// import { ChatRoomsService } from '../services/chat-rooms'

export const router = new Router({
  prefix: '/chat-rooms' as '/chat-rooms'
})
  .post('/:chatRoomId/messages ', async ctx => {
    // const [ oStr, createAt, senderId, ...receiverIds ] = ctx.params.chatRoomId.match(/^([\d+])(:\d:)+$/)
    // const { content } = ctx.request.body
    // await ChatRoomsService.pushMessage(+ctx.params.senderId, {
    //   content: content,
    //   createdAt: ctx.params.date
    // }, true)
  })
