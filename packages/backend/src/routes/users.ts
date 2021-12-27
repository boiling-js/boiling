import Router from '@koa/router'
import { Users } from '@boiling/core'
import { UsersService } from '../services/users'
import { Security } from '../utils'

export const router = new Router({
  prefix: '/users'
})
  .post('/', async ctx => {
    const { username, password } = <Users.Register>ctx.request.body
    const user = await UsersService.add({ username, passwordHash: Security.encrypt(password) })
    ctx.body = { id: user.id, username: user.username }
  })
  .get('/', async ctx => {
    const { key } = <{ key: string }>ctx.query
    ctx.body = await UsersService.search(key)
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
        ctx.body = 'you login.'
        break
      case 'offline':
        ctx.body = 'you logout.'
        break
    }
  })
  .post('/:id/friends/:uid', async ctx => {
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
