import Router from '@koa/router'
import { UsersService } from '../services/users'
import { StatusCodes } from 'http-status-codes'
import { Security } from '../utils'

type Register = Omit<UsersService.U, 'passwordHash'> & {
  /** 用户密码 */
  password: string
}

export const router = new Router({
  prefix: '/users'
})
  .post('/', async ctx => {
    const { username, password } = ctx.request.body as Register
    try {
      await UsersService.add({ username, passwordHash: Security.encrypt(password) })
    } catch (e) {
      if (e instanceof Error) {
        ctx.status = StatusCodes.CONFLICT
        ctx.body = e.message
      }
      return
    }
    ctx.body = {
      username: username
    }
  })
  .get('/', async ctx => {
    ctx.body = 'you are searching users.'
  })
  .post('/:id/login', async ctx => {
    ctx.body = 'you login.'
  })
  .get('/:id/logout', async ctx => {
    ctx.body = 'you logout.'
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
  })
