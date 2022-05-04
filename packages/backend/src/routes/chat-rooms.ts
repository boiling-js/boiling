import Schema from 'schemastery'
import { ChatRooms, Messages, Router } from '@boiling/core'
import { ChatRoomsService } from '../services/chat-rooms'
import usePagination from '../hooks/usePagination'
import { clients } from './ws'
import useCurUser from '../hooks/useCurUser'

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
    return ChatRoomsService.create(members.concat(useCurUser(ctx.session).id), opts)
  })
  /**
   * 添加消息
   */
  .post(Schema.Pick(Messages.Model, ['content']), Schema.any(), '/:chatRoomId/messages', async ctx => {
    const { content } = ctx.request.body
    const senderId = useCurUser(ctx.session).id
    const m = await ChatRoomsService.Message.create(ctx.params.chatRoomId, senderId, content)
    const { members } = await ChatRoomsService.get(ctx.params.chatRoomId) || {}
    members?.filter(id => id !== senderId)?.forEach(memberId =>
      clients.get(memberId)?.dispatch('MESSAGE', m)
    )
    return m
  })
  /**
   * 获取聊天室消息列表
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
  .get('/:chatRoomId/messages?key&page(number)&num(number)', async ctx => {
    const { chatRoomId } = ctx.params
    return usePagination(ChatRoomsService.Message, ctx.query, [
      ['createdAt', -1]
    ])(chatRoomId)
  })
  /**
   * 获取聊天室成员列表
   */
  .get('/:chatRoomId/members', async ctx => {
    const { chatRoomId } = ctx.params
    return ChatRoomsService.User.get(chatRoomId)
  })
  /**
   * 更新聊天室
   */
  .patch(Schema.Pick(ChatRooms.Model, ['name', 'avatar']), Schema.any(), '/:chatRoomId',  async ctx => {
    const { chatRoomId } = ctx.params
    const { name, avatar } = ctx.request.body
    return ChatRoomsService.update(chatRoomId, { name, avatar })
  })
