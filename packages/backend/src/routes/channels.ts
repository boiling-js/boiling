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
