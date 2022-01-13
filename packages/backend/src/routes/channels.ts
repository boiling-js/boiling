import { Router } from '@boiling/core'
import Schema from 'schemastery'

export const router = new Router({
  prefix: '/channels'
}).post(Schema.string(), '/', async ctx => {
    return 'you are creating channel.'
  })
  .del(Schema.string(), '/:id', async ctx => {
    return 'you are deleting channel'
  })
  .patch(Schema.string(), '/:id', async ctx => {
    return 'you are patching channel'
  })
  .get(Schema.string(), '/', async ctx => {
    return 'you are searching channels'
  })
  .get(Schema.string(), '/:id', async ctx => {
    return 'you are getting channel'
  })
  .get(Schema.string(), '/:id/members', async ctx => {
    return 'you are getting channel members.'
  })
  .post(Schema.string(), '/:id/members', async ctx => {
    return 'you join to channel.'
  })
  .post(Schema.string(), '/:id/messages', async ctx => {
    return 'you are posting message.'
  })
