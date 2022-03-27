import Schema from 'schemastery'
import { ChatRooms, Messages, Router } from '@boiling/core'
import { ChatRoomsService } from '../services/chat-rooms'
import usePagination from '../hooks/usePagination'

export const router = new Router({
  prefix: '/chat-rooms' as '/chat-rooms'
})
  /**
   * 获取聊天室
   */
  .get(ChatRooms.Model, '?key', ctx => {
    const { key } = ctx.query
    const keywords = decodeURI(key).split(' ')
    const names: string[] = []
    const members: number[] = []
    keywords.forEach(keyword => {
      const [type, content] = keyword.split(':')
      if (!!content && type === 'members') {
        const ids = content.split(',').map(id => parseInt(id))
        members.push(...ids)
      } else {
        names.push(keyword)
      }
    })
    return ChatRoomsService.getOrThrow(members) as any as ChatRooms.Model
  })
  /**
   * 创建聊天室
   */
  .post(Schema.Pick(ChatRooms.Model, ['members', 'name', 'avatar']), Schema.any(), '', async ctx => {
    const { members, ...opts } = ctx.request.body
    return ChatRoomsService.create(members, opts)
  })
  /**
   * 添加消息
   */
  .post(Schema.Pick(Messages.Model, ['content']), Schema.any(), '/:chatRoomId/messages/:senderId(number)', async ctx => {
    const { content } = ctx.request.body
    await ChatRoomsService.Message.create(ctx.params.chatRoomId, ctx.params.senderId, content)
  })
  /**
   * 获取聊天室消息列表
   */
  .get('/:chatRoomId/messages?key&page(number)&num(number)', async ctx => {
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
    return usePagination(ChatRoomsService.Message, ctx.query)(chatRoomId)
  })
