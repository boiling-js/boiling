import Schema from 'schemastery'
import { ChatRooms, Router } from '@boiling/core'
import { ChatRoomsService } from '../services/chat-rooms'
import { clients } from './ws'

export const router = new Router({
  prefix: '/chat-rooms' as '/chat-rooms'
})
  /**
   * 创建聊天室
   */
  .post(Schema.Omit(ChatRooms.Model, ['id']), Schema.any(), '', async ctx => {
    await ChatRoomsService.create(ctx.request.body)
  })
  /**
   * 添加消息
   */
  .post('/:chatRoomId/messages', async ctx => {
    const [ createAt, senderId, ...receiverIds ] = ctx.params.chatRoomId.split(':').slice(0, -1)
    const receiverArr = receiverIds.map(id => +id)
    const { content } = ctx.request.body
    const message = await ChatRoomsService.Message.create(+senderId, {
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
  .get('/:chatRoomId/messages', async ctx => {
    /**
     * 获取最近十条消息
     * 获取时间段消息列表
     * 检索消息
     *
     * 排序
     *   按照时间升降序
     * 数量
     *   分页器：页码、单页数目
     * 时间
     *   消息创建时间范围
     * 内容
     *   发送者信息、消息内容
     */
    const { chatRoomId } = ctx.params
    return ChatRoomsService.getMessages(chatRoomId)
  })
