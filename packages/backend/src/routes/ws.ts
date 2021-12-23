import { Middleware } from 'koa-websocket'

export const router: Middleware = async (context, next) => {
  if (!/^\/ws.*/.test(context.url))
    return await next()

  const { websocket: ws } = context
}

export namespace WS {
  export namespace Message {
    export interface Resp {}
  }
  export type Event = {
    t: 'MESSAGE'
    p: Message.Resp
  }
}
