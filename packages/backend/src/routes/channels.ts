import { ChatRooms, Router } from '@boiling/core'
import { ChannelsService } from '../services/channels'
import Schema from 'schemastery'
import useCurUser from '../hooks/useCurUser'

export const router = new Router({
  prefix: '/channels'
})
  /**
   * 创建讨论组
   */
  .post(Schema.Pick(ChatRooms.Model, ['members', 'name', 'avatar']), Schema.any(), '', async ctx => {
    const { name, avatar, description } = ctx.request.body
    return ChannelsService.create(useCurUser(ctx.session).id,{
      name,
      avatar,
      description
    })
  })
