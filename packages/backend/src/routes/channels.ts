import { Channels, Pagination, Router } from '@boiling/core'
import { ChannelsService } from '../services/channels'
import Schema from 'schemastery'
import useCurUser from '../hooks/useCurUser'
import usePagination from '../hooks/usePagination'
import extendService from '../hooks/extendService'

export const router = new Router({
  prefix: '/channels'
})
  /**
   * 获取频道列表
   */
  .get(Pagination(Channels.Model), '?key&page(number)&num(number)', ctx => {
    // @ts-ignore
    ctx.query.key = ''
    return usePagination(
      extendService(ChannelsService, 'search', m => m), ctx.query
    )(decodeURI(ctx.query.key))
  })
  /**
   * 创建讨论组
   */
  .post(Schema.Pick(Channels.Model, ['members', 'name', 'avatar']), Schema.any(), '', async ctx => {
    const { name, avatar, description } = ctx.request.body
    return ChannelsService.create(useCurUser(ctx.session).id,{
      name,
      avatar,
      description
    })
  })
  /**
   * 通过频道id获取频道信息
   */
  .get('/:channelId', async ctx => {
    const { channelId } = ctx.params
    return ChannelsService.get(channelId)
  })
  /**
   * 更新频道信息
   */
  .patch('/:channelId', async ctx => {
    const { channelId } = ctx.params
    const { name, avatar, description, members } = ctx.request.body
    return ChannelsService.update(channelId, {
      name,
      avatar,
      description,
      members
    })
  })
  /**
   * 删除频道
   */
  .delete('/:channelId', async ctx => {
    const { channelId } = ctx.params
    const channel = await ChannelsService.getOrThrow(channelId)
    if (
      !channel.members
        .every(m => m.id === useCurUser(ctx.session).id && m.rules?.includes('owner'))
    ) throw new HttpError('UNAUTHORIZED', '无权限删除该频道')
    return ChannelsService.del(channelId)
  })
  /**
   * 添加子频道
   */
  .post(Schema.Pick(Channels.SubChannelMeta, ['title']), Schema.any(), '/:channelId/subChannels', async ctx => {
    const { channelId } = ctx.params
    const { title } = ctx.request.body
    return ChannelsService.addSubChannel(channelId, title)
  })
  /**
   * 添加成员
   */
  .post('/:channelId/members', async ctx => {
    const { channelId } = ctx.params
    const { members } = ctx.request.body
    return ChannelsService.addMember(channelId, members)
  })
  /**
   * 添加聊天室
   */
  .post('/:channelId/chatRooms/:chatRoomId', async ctx => {
    const { channelId, chatRoomId } = ctx.params
    const { title, description } = ctx.request.body
    return ChannelsService.addChatRoom(channelId, title, chatRoomId, description)
  })
