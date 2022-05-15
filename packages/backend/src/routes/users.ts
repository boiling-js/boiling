import { Users, Router, Pagination } from '@boiling/core'
import Schema from 'schemastery'

import { UsersService } from '../services/users'
import { Security } from '../utils'
import usePagination from '../hooks/usePagination'
import extendService from '../hooks/extendService'
import useTarget from '../hooks/useTarget'
import useCurUser from '../hooks/useCurUser'
import { ChatRoomsService } from '../services/chat-rooms'

declare module '@boiling/core' {
  interface PathParams {
    uid: Schema<number | '@me'>
  }
}
Router.extendParamTypes(
  'uid', Schema.union([Schema.number(), '@me']).processor(v => {
    const type = typeof v
    if (type !== 'string' && type !== 'number')
      throw new Error('uid must be a number or @me')
    return v === '@me'
      ? v
      : Number(v)
  }), /(@me)|(([-+])?\d+(\.\d+)?)/)

export const router = new Router({
  prefix: '/users' as '/users'
})
  .post('', async ctx => {
    const { username, password } = <Users.Register>ctx.request.body
    const user = await UsersService.add({
      username,
      passwordHash: Security.encrypt(password),
      avatar: `/img/avatar/${ Math.floor(Math.random() * 10) }.jpg`
    })
    return { id: user.id, username: user.username, avatar: user.avatar }
  })
  .get(Pagination(Users.BaseOut), '?key&page(number)&num(number)', ctx => {
    return usePagination(
      extendService(UsersService, 'search', m => m.find({
        id: { $ne: useCurUser(ctx.session).id }
      })), ctx.query
    )(ctx.query.key)
  })
  .get('/:id(number)', async ctx => {
    return UsersService.get(ctx.params.id)
  })
  .post(Users.Login, Users.Out.or(Schema.any()), '/:id(number)/status', async ctx => {
    const { status, password } = ctx.request.body
    switch (status) {
      case 'online':
        const u = await UsersService.get(+ctx.params.id)
        if (u === null)
          throw new HttpError('NOT_FOUND', '用户不存在')
        if (!Security.match(password, u.passwordHash))
          throw new HttpError('UNPROCESSABLE_ENTITY', '密码错误')
        const user = u.toJSON()
        if (ctx.session)
          ctx.session.curUser = <Users.Out><any>user
        else
          throw new HttpError('INTERNAL_SERVER_ERROR', '服务器内部错误')
        await UsersService.update(u.id, { status: 'online' })
        return user
    }
  })
  .patch(Schema.interface({
    status: Users.Status
  }), Schema.any(), '/:id(uid)/status', async ctx => {
    const { status } = ctx.request.body
    await UsersService.update(useCurUser(ctx.session).id, { status })
    switch (status) {
      case 'offline':
        ctx.session && delete ctx.session.curUser
        return
    }
  })
  .post(Users.Friend, Schema.any(), '/:id(uid)/friends', ctx => {
    const { id: fid, ...opts } = ctx.request.body
    return UsersService.Friends.add(
      useTarget(ctx.session, ctx.params.id),
      +fid, opts
    )
  })
  .patch(Schema.any(), '/:id(uid)/friends/:targetId(number)', ctx => {
    return UsersService.Friends.update(
      useTarget(ctx.session, ctx.params.id),
      ctx.params.targetId, <Users.Friend>ctx.request.body
    )
  })
  .delete('/:id(uid)/friends/:targetId(number)', ctx => {
    return UsersService.Friends.del(
      useTarget(ctx.session, ctx.params.id),
      ctx.params.targetId
    )
  })
  .get(Schema.array(Users.FriendOut), '/:id(uid)/friends?key&page(number)&num(number)', ctx => {
    return UsersService.Friends.get(useTarget(ctx.session, ctx.params.id))
  })
  .post('/:id(uid)/tag', ctx => {
    const { tag } = ctx.request.body
    if (!tag)
      throw new HttpError('BAD_REQUEST', '标签不能为空')
    return UsersService.addTag(useTarget(ctx.session, ctx.params.id), tag)
  })
  .get('/:id(number)/channels', async ctx => {
    return ctx
  })
  .del('/:id(number)/channels/:cid', async ctx => {
    console.log(ctx.params)
  })
  .get('/avatars', async () => {
    return UsersService.getAvatars()
  })
  /** 更新用户头像 */
  .patch('/:id(uid)/avatar', async ctx => {
    const { avatar } = ctx.request.body
    if (!avatar)
      throw new HttpError('BAD_REQUEST', '头像不能为空')
    return UsersService.update(useTarget(ctx.session, ctx.params.id), { avatar })
  })
  /** 更新用户信息 */
  .patch('/:id(uid)', async ctx => {
    const { username, sex, birthday, desc } = ctx.request.body
    return UsersService.update(useTarget(ctx.session, ctx.params.id), {
      username, sex, birthday, desc
    })
  })
  /** 获取用户讨论组 */
  .get('/:id(uid)/groups', ctx => {
    return ChatRoomsService.getGroupByUid(useTarget(ctx.session, ctx.params.id))
  })
  /** 更改密码 */
  .patch('/:id(uid)/password', ctx => {
    const { oldPwd, newPwd } = ctx.request.body
    return  UsersService.updatePassword(useTarget(ctx.session, ctx.params.id), oldPwd, newPwd)
  })
