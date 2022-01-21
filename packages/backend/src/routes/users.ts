import { Users, Router, Pagination } from '@boiling/core'
import Schema from 'schemastery'

import { UsersService } from '../services/users'
import { Security } from '../utils'
import usePagination from '../hooks/usePagination'
import extendService from '../hooks/extendService'
import useTarget from '../hooks/useTarget'
import useCurUser from '../hooks/useCurUser'

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
    )()
  })
  .get('/:id(number)', async ctx => {
    return UsersService.get(ctx.params.id)
  })
  .post(Users.Status, Users.Out.or(Schema.any()), '/:id(number)/status', async ctx => {
    const { status, password } = ctx.request.body
    switch (status) {
      case 'online':
        const u = await UsersService.get(+ctx.params.id)
        if (u === null)
          throw new HttpError('NOT_FOUND', '用户不存在')
        if (!Security.match(password, u.passwordHash))
          throw new HttpError('UNAUTHORIZED', '密码错误')
        const user = u.toJSON()
        if (ctx.session)
          ctx.session.curUser = <Users.Out><any>user
        else
          throw new HttpError('INTERNAL_SERVER_ERROR', '服务器内部错误')
        return user
      case 'offline':
        ctx.session && delete ctx.session.curUser
        return
    }
  })
  .post(Schema.any(), '/:id(uid)/friends', ctx => {
    const { id: fid, ...opts } = <Users.Friend>ctx.request.body
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
  .get('/:id(uid)/friends', ctx => {
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
    return UsersService.getAvatar()
  })
  .patch('/:id(uid)/avatar', async ctx => {
    const { avatar } = ctx.request.body
    if (!avatar)
      throw new HttpError('BAD_REQUEST', '头像不能为空')
    return UsersService.updateAvatar(useTarget(ctx.session, ctx.params.id), avatar)
  })
