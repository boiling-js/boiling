import Schema from 'schemastery'
import { ChatRooms, Router } from '@boiling/core'
import { ChatRoomsService } from '../services/chat-rooms'

export const router = new Router({
  prefix: '/chat-rooms' as '/chat-rooms'
})
  /**
   * 创建聊天室
   */
  .post(Schema.Pick(ChatRooms.Model, ['members', 'name', 'avatar']), Schema.any(), '', async ctx => {
    const { members, ...opts } = ctx.request.body
    await ChatRoomsService.create(members, opts)
  })
  /**
   * 添加消息
   */
  .post('/:chatRoomId/messages', async ctx => {
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
