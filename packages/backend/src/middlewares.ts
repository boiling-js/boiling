import Koa from 'koa'
import { AppContext } from './'

export namespace Middlewares {
  export async function handleErrors(ctx: AppContext, next: Koa.Next) {
    try {
      await next()
    } catch (e) {
      if (e instanceof HttpError) {
        ctx.body = e.msg
        ctx.status = e.code
        return
      }
      throw e
    }
  }
  export async function returnBody(ctx: AppContext, next: Koa.Next) {
    const body = await next()
    if (!ctx.body)
      ctx.body = body
  }
}
