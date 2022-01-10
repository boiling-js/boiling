import Koa from 'koa'
import Schema from 'schemastery'
import From = Schema.From

type extendObj<O, K extends string, V> = O & { [key in K]: V }

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PathParams extends Router.InnerParamTypes {
}

type OnlyOutRouterMethods<O extends Router.Options, Docs> = {
  [Method in Router.Methods]: <
    P extends string, Res extends Schema,
    _P extends string = Router.ComputedPath<O, P>, _Res = From<Res>,
    Ctx = Router.Context<never, Router.ResolvePath<_P>>
  >(out: Res, path: P, middleware: Router.MiddleWare<Ctx, _Res>) => Router<O, extendObj<
    Docs, _P, { [K in Method]: Ctx }
  >>
}
type WithInnRouterMethods<O extends Router.Options, Docs> = {
  [Method in Router.Methods]: <
    P extends string, Req extends Schema, Res extends Schema,
    _P extends string = Router.ComputedPath<O, P>, _Res = From<Res>,
    Ctx = Router.Context<never, Router.ResolvePath<_P>>
  >(inn: Req, out: Res, path: P, middleware: Router.MiddleWare<Ctx, _Res>) => Router<O, extendObj<
    Docs, _P, { [K in Method]: Ctx }
  >>
}

type R<O extends Router.Options = {}, Docs = unknown> = {
  opts: O
  docs: Docs
} & OnlyOutRouterMethods<O, Docs>

export interface Router<O extends Router.Options, Docs> extends R<O, Docs> {
  new(opts?: O): this
}

export class Router<O extends Router.Options, Docs> {
  opts: O
  docs: Docs
  allowedMethods: Router.Methods[] = []
  middlewares: Router.MiddleWare<Router.Context<From<Schema>>, From<Schema>>[] = []
  constructor(opts?: O) {
    this.docs = {} as Docs
    this.opts = Object.assign({}, opts)
    return Router.attach(this)
  }

  dispatch(ctx: Koa.Context, next: Koa.Next) {
    return next()
  }
}

export namespace Router {
  function proxyMiddleware(
    onApply: (inn: Schema<any>, out: Schema<any>, path: string, middleware: Router.MiddleWare<Context<any, any>, any>) => any
  ) {
    return new Proxy(() => {}, {
      apply(_, __, args) {
        let inn: Schema<any>, out: Schema<any>, path: string, middleware: Router.MiddleWare<Context<any, any>, any>
        if (typeof args[1] === 'string') {
          [out, path, middleware] = args
          inn = Schema.any()
        } else {
          [inn, out, path, middleware] = args
        }
        return onApply(inn, out, path, middleware)
      }
    })
  }
  export function attach<O extends Router.Options, Docs>(r: Router<O, Docs>) {
    const proxy: Router<O, Docs> = new Proxy(r, {
      get(target, p, receiver) {
        const method = p as Router.Methods
        if (Router.methods.includes(method))
          return proxyMiddleware((inn, out, path, middleware) => {
            const params = resolvePath(path)
            console.log(params)
            target.middlewares.push(middleware)
            target.allowedMethods.push(method)
            target.docs = Object.assign(target.docs, {
              [path]: { [method]: inn }
            })
            return proxy
          })
        return Reflect.get(target, p, receiver)
      }
    })
    return proxy
  }
  export type MiddleWare<CTX, Res> = (ctx: CTX) => Res | Promise<Res>
  export type Context<Body, Params = {}> = Koa.BaseContext & {
    req: { body: Body }
    body: Body
    params: Params
  }
  export type Methods = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head'
  export const methods = ['get', 'post', 'put', 'delete', 'patch', 'head']

  export type Options = {
    prefix?: string
  }
  const paramTypes = {
    string: Schema.string(),
    number: Schema.number(),
    boolean: Schema.boolean()
  }
  const paramTypesRegex = <Record<keyof PathParams, RegExp | undefined>>{
    string: /[A-Za-z]+\w+/,
    number: /(\-|\+)?\d+(\.\d+)?/,
    boolean: /0|1|(F|false)|(T|true)/
  }
  type innerParamTypes = typeof paramTypes
  export type InnerParamTypes = {
    [K in keyof innerParamTypes]: From<innerParamTypes[K]>
  }
  export function extendParamTypes<T extends Schema>(name: keyof PathParams, paramType: T, r?: RegExp) {
    // @ts-ignore
    paramTypes[name] = paramType
    paramTypesRegex[name] = r
  }
  export type ComputedPath<O extends Options, P extends string> = O['prefix'] extends undefined
    ? P : `${ O['prefix'] }${ P }`
  export type ResolvePath<P extends string> =
    P extends `${ infer _L }/:${ infer Param }/${ infer _R }`
      ? ResolveParam<Param>
      : P extends `${ infer _L }/:${ infer Param }`
        ? ResolveParam<Param>
        : {}
  export type ResolveParam<P extends string> =
    P extends `${ infer L }(${ infer Type })`
      ? extendObj<{}, L, Type extends keyof PathParams ? PathParams[Type] : never>
      : extendObj<{}, P, Schema<string>>
  function resolveDesc(desc?: string) {
    if (!desc)
      desc = '(string)'
    const [, type] = desc.match(/^\((.*)\)$/) || []
    if (type in paramTypes)
      // @ts-ignore
      return paramTypes[type]
    else
      throw new Error(`Unsupported param type: ${ type }`)
  }
  export function resolvePath<P extends string>(path: P): ResolvePath<P> {
    const params = {}
    for (const param of path.split('/')) {
      if (!param.startsWith(':'))
        continue

      const [, name, desc = '(string)'] = param.match(/^:(\w+)(\(\w+\))?/) || []
      // @ts-ignore
      params[name] = resolveDesc(desc)
    }
    return params as any as ResolvePath<P>
  }
}
