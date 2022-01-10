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
  >(out: Res, path: P, middleware: Router.MiddleWare<Ctx, _Res>) => R<O, extendObj<Docs, _P, { [K in Method]: Ctx }>>
}
type WithInnRouterMethods<O extends Router.Options, Docs> = {
  [Method in Router.Methods]: <
    P extends string, Req extends Schema, Res extends Schema,
    _P extends string = Router.ComputedPath<O, P>, _Res = From<Res>
  >(
    inn: Req, out: Res,
    path: P, middleware: Router.MiddleWare<Router.Context<Req>, _Res>
  ) => R<O, Router.ExtendDoc<
    Docs, _P, Method, Router.Context<Req, Router.ResolveParam<_P>>
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
}

export namespace Router {
  export function attach<O extends Router.Options, Docs>(r: Router<O, Docs>) {
    return new Proxy(r, {
      get(target, p, receiver) {
        if (Router.methods.includes(p as Router.Methods))
          return new Proxy(() => {}, {
            apply(_, __, args) {
              target.allowedMethods.push(p as Router.Methods)
            }
          })

        return Reflect.get(target, p, receiver)
      }
    })
  }
  export type MiddleWare<CTX, Res> = (ctx: CTX) => Res | Promise<Res>
  export type Context<Body, Params = {}> = Koa.BaseContext & {
    req: { body: Body }
    body: Body
    params: Params
  }
  export type ExtendDoc<O, K extends string, M extends string, Ctx extends Context<any>> = extendObj<O, K, { [m in M]: Ctx }>
  export const methods = ['get', 'post', 'put', 'delete', 'patch', 'head']
  export type Methods = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head'

  export type Options = {
    prefix?: string
  }
  const paramTypes = {
    string: Schema.string(),
    number: Schema.number(),
    boolean: Schema.boolean()
  }
  type innerParamTypes = typeof paramTypes
  export type InnerParamTypes = {
    [K in keyof innerParamTypes]: From<innerParamTypes[K]>
  }
  export function extendParamTypes<T extends Schema>(name: keyof PathParams, paramType: T) {
    // @ts-ignore
    paramTypes[name] = paramType
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
      // @ts-ignore
      ? extendObj<{}, L, Type extends keyof PathParams ? PathParams[Type] : PathParams[Type]>
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
