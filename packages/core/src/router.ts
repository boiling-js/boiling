import Schema from 'schemastery'
import From = Schema.From

type extendObj<O, K extends string, V> = O & { [key in K]: V }

type R<O extends Router.Options = {}, Docs = unknown> = {
  opts: O
  docs: Docs
}
//   & {
//   [Method in Router.Methods]:
//   <P extends string, Req extends Schema, Res extends Schema>(
//     out: Res,
//     path: P, middleware: Router.MiddleWare<Router.Context<From<Req>>, Res>
//   ) => R<O, Router.extendDoc<Docs, Router.ComputedPath<O, P>, Method, From<Req>, From<Res>>>
// } & {
//   [Method in Router.Methods]:
//   <P extends string, Req extends Schema, Res extends Schema>(
//     inn: Req, out: Res,
//     path: P, middleware: Router.MiddleWare<Router.Context<Req>, Res>
//   ) => R<O, Router.extendDoc<Docs, Router.ComputedPath<O, P>, Method, Req, Res>>
// }

export interface Router<O extends Router.Options, Docs> extends R<O, Docs> {
  new(opts?: O): this
}

export class Router<O extends Router.Options, Docs> {
  opts: O
  docs: Docs
  constructor(opts?: O) {
    this.docs = {} as Docs
    this.opts = Object.assign({}, opts)
    return Router.attach(this)
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PathParams extends Router.InnerParamTypes {
}

export namespace Router {
  export function attach<O extends Router.Options, Docs>(r: Router<O, Docs>) {
    return new Proxy(r, {
      get(target, p, receiver) {
      }
    })
  }
  export type MiddleWare<CTX, Res extends Schema> = (ctx: CTX) => From<Res> | Promise<From<Res>>
  export type Context<Body> = {
    body: Body,
    req: { body: Body }
  }
  export type extendDoc<O, K extends string, M extends string, Body, Res> = extendObj<O, K, {
    [m in M]: Context<Body> & { res: Res }
  }>
  export const methods = ['get', 'post', 'put', 'delete', 'patch']
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
