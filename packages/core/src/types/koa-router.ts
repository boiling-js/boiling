import { RouterOptions } from '@koa/router'

declare module '@koa/router' {
  interface Router<Prefix extends string> {
    // eslint-disable-next-line @typescript-eslint/no-misused-new
    new(opts?: Omit<RouterOptions, 'prefix'> & {
      prefix: Prefix
    }): Router<Prefix>
  }
}

type Context<Req> = {
  req: Req
}
type extendObj<O, K extends string, V> = O & { [key in K]: V }

type Router<Docs = Record<string, any>> = {
  docs: Docs
  get<P extends string, Req extends any, Res extends any>(
    path: P, middleware: (ctx: { req: Req }) => Res | Promise<Res>
  ): Router<extendObj<Docs, P, {
    get: {
      req: Req
      res: Res
    }
  }>>
}
const r = (<Router>{
  docs: {},
  get(p, middleware) {
    this.docs[p].get = middleware
  }
})
  .get('/a/:name', (ctx: Context<number>) => String(ctx.req))
  .get('/b', (ctx: Context<string>) => Number(ctx.req))
r.docs['/a/:name']
