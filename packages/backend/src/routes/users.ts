import Router from '@koa/router'
import { Pagination, SearchQuery, Users } from '@boiling/core'
import { UsersService } from '../services/users'
import { Security } from '../utils'
import usePagination from '../hooks/usePagination'

export const router = new Router({
  prefix: '/users'
})
  .post('/', async ctx => {
    const { username, password } = <Users.Register>ctx.request.body
    const user = await UsersService.add({
      username,
      passwordHash: Security.encrypt(password),
      avatar: `/img/avatar/${ Math.floor(Math.random() * 10) }.jpg`
    })
    ctx.body = { id: user.id, username: user.username, avatar: user.avatar }
  })
  .get('/', async ctx => {
    ctx.body = await usePagination(
      UsersService, <SearchQuery>ctx.query
      // @ts-ignore
    )<Users.Out>(item => (delete item._doc.passwordHash) && item)
  })
  .get('/:id', async ctx => {
    ctx.body = await UsersService.get(ctx.params.id)
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
        const { passwordHash: _, ...user } = u
        ctx.session!.curUser = user
        ctx.body = user
        break
      case 'offline':
        delete ctx.session!.curUser
        ctx.body = 'you logout.'
        break
    }
  })
  .post('/:id/friends/:uid', async ctx => {
    // requirePermissions(ctx)
    ctx.body = []
  })
  .get('/:id/friends', async ctx => {
    ctx.body = []
  })
  .get('/:id/channels', async ctx => {
    ctx.body = []
  })
  .del('/:id/channels/:cid', async ctx => {
    console.log(ctx.params)
  })
