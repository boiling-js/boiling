import Schema from 'schemastery'
import { ChatRooms, Messages, Pagination, Router } from '@boiling/core'
import { ChatRoomsService } from '../services/chat-rooms'
import usePagination from '../hooks/usePagination'
import { clientManager } from './ws'
import useCurUser from '../hooks/useCurUser'
import extendService from '../hooks/extendService'
import useTarget from '../hooks/useTarget'

export const router = new Router({
  prefix: '/chat-rooms' as '/chat-rooms'
})
  /**
   * 获取聊天室
   */
  .get(Pagination(ChatRooms.Model), '?key&page(number)&num(number)', ctx => {
    return usePagination(
      extendService(ChatRoomsService, 'search', m => m), ctx.query
    )(decodeURI(ctx.query.key))
  })
  /**
   * 创建聊天室
   */
  .post(Schema.Pick(ChatRooms.Model, ['members', 'name', 'avatar']), Schema.any(), '', async ctx => {
    const { members, ...opts } = ctx.request.body
    return ChatRoomsService.create([
      ...new Set<number>(members.concat(useCurUser(ctx.session).id))
    ], opts)
  })
  /**
   * 添加消息
   */
  .post(Schema.Pick(Messages.Model, ['content']), Schema.any(), '/:chatRoomId/messages', async ctx => {
    const { content } = ctx.request.body
    const senderId = useCurUser(ctx.session).id
    const m = await ChatRoomsService.Message.create(ctx.params.chatRoomId, senderId, content)
    const { members } = await ChatRoomsService.get(ctx.params.chatRoomId) || {}
    members
      ?.filter(id => id !== senderId)
      ?.forEach(
        memberId => clientManager
          .proxyTo(memberId)
          ?.map(client => client?.dispatch('MESSAGE', m))
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
  .patch('/:chatRoomId',  async ctx => {
    const { chatRoomId } = ctx.params
    const { name, avatar, members } = ctx.request.body
    return ChatRoomsService.update(chatRoomId, { name, avatar, members })
  })
  /**
   * 删除聊天室成员
   */
  .delete('/:chatRoomId/members/:userId(uid)', async ctx => {
    console.log('del')
    return ChatRoomsService.User.del(ctx.params.chatRoomId, useTarget(ctx.session, ctx.params.userId))
  })
