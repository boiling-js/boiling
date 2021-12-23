import Router from '@koa/router'

export const router = new Router({
  prefix: '/users'
}).post('/', async ctx => {
    ctx.body = 'register.'
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
