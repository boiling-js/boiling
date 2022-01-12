import Koa from 'koa'
import Schema from 'schemastery'
import From = Schema.From

declare module 'schemastery' {
  interface Schema<S = any, T = S> {
    processor(processor: (o: any) => S): Schema<S, T>
  }
  namespace Schema {
    interface Meta<T = any> {
      processor: (o: any) => T
    }
  }
}
Schema.prototype.processor = function (processor) {
  if (this.meta)
    this.meta.processor = processor
  return this
}

type extendObj<O, K extends string, V> = O & { [key in K]: V }

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PathParams extends Router.InnerParamTypes {
}

type Params2Record<O extends Record<string, Router.ParamType<Schema<any>>>> = {
  [K in keyof O]: O[K] extends Router.ParamType<Schema<infer S>> ? S : never
}

type OnlyOutRouterMethods<O extends Router.Options, Docs> = {
  [Method in Router.Methods]: <
    P extends string, Out extends Schema,
    _P extends string = Router.ComputedPath<O, P>,
    Ctx = Router.Context<never, Params2Record<Router.ResolvePath<_P>>>
  >(out: Out, path: P, middleware: Router.MiddleWare<Ctx, Out extends Schema<infer S> ? S : never>) => Router<O, extendObj<
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
  middlewareMapper = (<Router.Methods[]>Router.methods).reduce(
    (acc, method) => (acc[method] = []) && acc,
    {} as { [key in Router.Methods]: {
      paramTypes: Record<string, Router.ParamType<Schema<any>>>
      pathRegexp: RegExp
      middlewares: Router.MiddleWare<Router.Context<From<Schema>>, From<Schema>>[]
    }[] }
  )
  constructor(opts?: O) {
    this.docs = {} as Docs
    this.opts = Object.assign({}, opts)
    return Router.attach(this)
  }

  middleware(ctx: Koa.Context, next: () => Awaited<any>) {
    const method = <Router.Methods>ctx.method
    if (this.opts.prefix && !ctx.path.startsWith(this.opts.prefix))
      return next()
    if (!this.allowedMethods.includes(method))
      return next()
    for (const item of this.middlewareMapper[method]) {
      if (item.pathRegexp.test(ctx.path)) {
        const ctx2 = Object.assign(ctx, {
          params: Router.resolveSource(ctx.path, item.paramTypes)
        })
        return item.middlewares.reduce(
          // @ts-ignore
          (acc, middleware) => acc.then(() => middleware(ctx2, next)),
          Promise.resolve()
        )
      }
    }
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
            const regExp = new RegExp(`^${Object.entries(params).reduce(
              (acc, [name, param]) => acc.replace(new RegExp(`:${name}(\\(\\w+\\))?`), param.regex.source),
              `${target.opts.prefix || ''}${path}`
            )}`)
            target.allowedMethods.push(method)
            target.middlewareMapper[method].push({
              paramTypes: params,
              pathRegexp: regExp,
              middlewares: [middleware]
            })
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
  export type MiddleWare<CTX, Res> = (ctx: CTX) => Awaited<Res>
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
    number: Schema.number().processor(Number),
    boolean: Schema.boolean().processor((v) => {
      if (typeof v === 'string') {
        if (/1|(T|true)/.test(v))
          return true
        if (/0|(F|false)/.test(v))
          return false
      }
      return v
    })
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
  export type ParamType<S extends Schema> = {
    pre: string
    type: keyof PathParams
    regex: RegExp
    schema: S
  }
  export type ComputedPath<O extends Options, P extends string> = O['prefix'] extends undefined
    ? P : `${ O['prefix'] }${ P }`
  export type ResolvePath<P extends string> =
    P extends `${ infer _L }/:${ infer Param }/${ infer _R }`
      ? ResolveParam<Param>
      : P extends `${ infer _L }/:${ infer Param }`
        ? ResolveParam<Param>
        : Record<string, ParamType<Schema<any>>>
  export type ResolveParam<P extends string> =
    P extends `${ infer L }(${ infer Type })`
      ? extendObj<{}, L, ParamType<Type extends keyof PathParams ? PathParams[Type] : never>>
      : extendObj<{}, P, ParamType<Schema<string>>>
  function resolveDesc(pre: string, desc?: string) {
    if (!desc)
      desc = '(string)'
    const [, type] = desc.match(/^\((.*)\)$/) || []
    if (type in paramTypes)
      return {
        pre, type,
        // @ts-ignore
        regex: paramTypesRegex[type],
        // @ts-ignore
        schema: paramTypes[type]
      }
    else
      throw new Error(`Unsupported param type: ${ type }`)
  }
  export function resolvePath<P extends string>(path: P): ResolvePath<P> {
    let pre = ''
    const params = {}
    for (const pathItem of path.split('/')) {
      if (!pathItem.startsWith(':')) {
        pathItem && (pre += `/${ pathItem }`)
        continue
      }

      const [, name, desc = '(string)'] = pathItem.match(/^:(\w+)(\(\w+\))?/) || []
      // @ts-ignore
      params[name] = resolveDesc(pre, desc)
    }
    return params as any as ResolvePath<P>
  }
  export function resolveSource<Rules extends {
    [name in string]: ParamType<Schema<any>>
  }, R = {
    [name in keyof Rules]: From<Rules[name]['schema']>
  }>(source: string, rules: Rules): R {
    return Object.entries(rules).reduce((acc, [name, { pre, regex, schema }]) => {
      const param = new RegExp(`${ pre }/(${ regex.source })`).exec(source)?.[1] ?? undefined
      acc[name] = schema(schema.meta
        ? schema.meta.processor?.(param) ?? param
        : param
      )
      return acc
    }, {} as any)
  }
}
