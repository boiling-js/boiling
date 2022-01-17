import Router from '@koa/router'
import { SearchQuery, Users } from '@boiling/core'

import { AppContext } from '../'
import { UsersService } from '../services/users'
import { Security } from '../utils'
import usePagination from '../hooks/usePagination'
import extendService from '../hooks/extendService'
import useTarget from '../hooks/useTarget'

export const router = new Router<{}, AppContext>({
  prefix: '/users'
})
  .post('/', async ctx => {
    const { username, password } = <Users.Register>ctx.request.body
    const user = await UsersService.add({
      username,
      passwordHash: Security.encrypt(password),
      avatar: `/img/avatar/${ Math.floor(Math.random() * 10) }.jpg`
    })
    return { id: user.id, username: user.username, avatar: user.avatar }
  })
  .get('/', async ctx => {
    return usePagination(
      extendService(UsersService, 'search', m => m.find({
        id: {
          $ne: ctx.session?.curUser?.id
        }
      })), <SearchQuery>ctx.query
      // @ts-ignore
    )<Users.Out>(item => (delete item._doc.passwordHash) && item)
  })
  .get('/:id', async ctx => {
    return UsersService.get(ctx.params.id)
  })
  .post('/:id/status', async ctx => {
    const {
      status, password
    } = <Users.Status>ctx.request.body
    switch (status) {
      case 'online':
        const u = await UsersService.get(+ctx.params.id)
        if (u === null)
          throw new HttpError('NOT_FOUND', '用户不存在')
        if (!Security.match(password, u.passwordHash))
          throw new HttpError('UNAUTHORIZED', '密码错误')
        const user = u.toJSON()
        // @ts-ignore
        delete user.passwordHash
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
  .post('/:id/friends/:uid', ctx => {
    return UsersService.Friends.add(
      useTarget(ctx.params, ctx.session,'id'),
      +ctx.params.uid, <Users.Friend>ctx.request.body)
  })
  .patch('/:id/friends/:uid', ctx => {
    return UsersService.Friends.update(
      useTarget(ctx.params, ctx.session,'id'),
      +ctx.params.uid, <Users.Friend>ctx.request.body)
  })
  .delete('/:id/friends/:uid', ctx => {
    return UsersService.Friends.del(
      useTarget(ctx.params, ctx.session,'id'),
      +ctx.params.uid)
  })
  .get('/:id/friends', ctx => {
    return UsersService.Friends.get(useTarget(ctx.params, ctx.session))
  })
  .post('/:id/tag', ctx => {
    const { tag } = ctx.request.body
    if (!tag)
      throw new HttpError('BAD_REQUEST', '标签不能为空')
    return UsersService.addTag(useTarget(ctx.params, ctx.session), tag)
  })
  .get('/:id/channels', async ctx => {
    return ctx
  })
  .del('/:id/channels/:cid', async ctx => {
    console.log(ctx.params)
  })
