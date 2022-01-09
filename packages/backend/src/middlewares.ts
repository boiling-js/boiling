import Koa from 'koa'
import { AppContext } from './'
import { HttpError } from './global/HttpError'

export namespace Middlewares {
  export async function handleErrors(ctx: AppContext, next: Koa.Next) {
    try {
      return await next()
    } catch (e) {
      if (e instanceof HttpError) {
        ctx.body = e.msg
        ctx.status = e.code
        return
      }
      throw e
    }
  }
}
