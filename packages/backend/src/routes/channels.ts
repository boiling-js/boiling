import Router from '@koa/router'

export const router = new Router({
  prefix: '/channels'
}).post('/', async ctx => {
    ctx.body = 'you are creating channel.'
  })
  .del('/:id', async ctx => {
    ctx.body = 'you are deleting channel'
  })
  .patch('/:id', async ctx => {
    ctx.body = 'you are patching channel'
  })
  .get('/', async ctx => {
    ctx.body = 'you are searching channels'
  })
  .get('/:id', async ctx => {
    ctx.body = 'you are getting channel'
  })
  .get('/:id/members', async ctx => {
    ctx.body = 'you are getting channel members.'
  })
  .post('/:id/members', async ctx => {
    ctx.body = 'you join to channel.'
  })
  .post('/:id/messages', async ctx => {
    ctx.body = 'you are posting message.'
  })
