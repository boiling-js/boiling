import { Middleware } from 'koa-websocket'

export const router: Middleware = async (context, next) => {
  if (!/^\/ws.*/.test(context.url))
    return await next()

  const { websocket: ws } = context
  ws.on('message', m => {
    console.log(m.toString())
  })
}
