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

type RouterMethods<O extends Router.Options, Docs> = {
  [Method in Router.Methods]: <
    P extends string,
    _P extends string = Router.ComputedPath<O, P>,
    Ctx = Router.Context<never, _P>
  >(path: P, middleware: Router.MiddleWare<Ctx, any>) => Router<O, extendObj<
    Docs, _P, { [K in Method]: Ctx }
  >>
}
type OnlyOutRouterMethods<O extends Router.Options, Docs> = {
  [Method in Router.Methods]: <
    P extends string, Out extends Schema,
    _P extends string = Router.ComputedPath<O, P>,
    Ctx = Router.Context<never, _P>
  >(out: Out, path: P, middleware: Router.MiddleWare<Ctx, Out extends Schema<infer S> ? S : never>) => Router<O, extendObj<
    Docs, _P, { [K in Method]: Ctx }
  >>
}
type WithInnRouterMethods<O extends Router.Options, Docs> = {
  [Method in Router.Methods]: <
    P extends string, Inn extends Schema, Out extends Schema,
    _P extends string = Router.ComputedPath<O, P>,
    Ctx = Router.Context<Inn extends Schema<infer S> ? S : never, _P>
  >(inn: Inn, out: Out, path: P, middleware: Router.MiddleWare<Ctx, Out extends Schema<infer S> ? S : never>) => Router<O, extendObj<
    Docs, _P, { [K in Method]: Ctx }
  >>
}

type R<O extends Router.Options = {}, Docs = unknown> = {
  opts: O
  docs: Docs
}
  & RouterMethods<O, Docs>
  & OnlyOutRouterMethods<O, Docs>
  & WithInnRouterMethods<O, Docs>

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
      inn: Schema<any>
      out: Schema<any>
      queryTypes: Record<string, Router.ParamType<Schema<any>>>
      paramTypes: Record<string, Router.ParamType<Schema<any>>>
      pathRegexp: RegExp
      middlewares: Router.MiddleWare<Router.Context<From<Schema>, ''>, From<Schema>>[]
    }[] }
  )
  constructor(opts?: O) {
    this.docs = {} as Docs
    this.opts = Object.assign({}, opts)
    return Router.attach(this)
  }

  middleware() {
    return ((ctx: Koa.Context, next: () => Awaited<any>) => {
      const method = <Router.Methods>ctx.method.toLowerCase()
      if (this.opts.prefix && !ctx.path.startsWith(this.opts.prefix))
        return Promise.resolve(next())
      if (!this.allowedMethods.includes(method))
        return Promise.resolve(next())
      for (const item of this.middlewareMapper[method]) {
        if (item.pathRegexp.test(ctx.path)) {
          // @ts-ignore
          item.inn(ctx.request.body)
          const { param, query } = Router.resolveSource(ctx.url, {
            query: item.queryTypes,
            param: item.paramTypes
          })
          const ctx2 = new Proxy(ctx, {
            get(target, prop) {
              if (prop === 'params')
                return param
              if (prop === 'query')
                return query
              return Reflect.get(target, prop)
            }
          })
          return item.middlewares.reduce<Promise<any>>(
            (acc, middleware) => acc
              // @ts-ignore
              .then(() => Promise.resolve(middleware(ctx2, next)).then(item.out)),
            Promise.resolve()
          )
        }
      }
      return Promise.resolve(next())
    }).bind(this)
  }
}

export namespace Router {
  function proxyMiddleware(
    onApply: (inn: Schema<any>, out: Schema<any>, path: string, middleware: Router.MiddleWare<Context<any, any>, any>) => any
  ) {
    return new Proxy(() => {}, {
      apply(_, __, args) {
        let inn: Schema<any>, out: Schema<any>, path: string, middleware: Router.MiddleWare<Context<any, any>, any>
        if (typeof args[0] === 'string') {
          [path, middleware] = args
          out = Schema.any()
          inn = Schema.any()
        } else if (typeof args[1] === 'string') {
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
        let method = p as Router.Methods
        if (Router.methods.includes(method)) {
          if (method === 'del')
            method = 'delete'
          return proxyMiddleware((inn, out, url, middleware) => {
            const [ path ] = url.split('?')
            const { param, query } = resolveURL(url)
            const regExp = new RegExp(`^${Object.entries(param).reduce(
              (acc, [name, param]) => acc.replace(new RegExp(`:${name}(\\(\\w+\\))?`), `(${param.regex.source})`),
              `${target.opts.prefix || ''}${path}`
            )}$`)
            target.allowedMethods.push(method)
            target.middlewareMapper[method].push({
              inn, out,
              queryTypes: query,
              paramTypes: param,
              pathRegexp: regExp,
              middlewares: [middleware]
            })
            target.docs = Object.assign(target.docs, {
              [url]: { [method]: { inn, out } }
            })
            return proxy
          })
        }
        return Reflect.get(target, p, receiver)
      }
    })
    return proxy
  }
  export type MiddleWare<CTX, Res> = (ctx: CTX) => Res | Promise<Res>
  type Params2Record<O extends Record<string, Router.ParamType<Schema<any>>>> = {
    [K in keyof O]: O[K] extends Router.ParamType<Schema<infer S>> ? S : never
  }
  export type Context<
    Body, URL extends string,
    R extends ResolveURL<URL> = ResolveURL<URL>,
    Query = Params2Record<R['query']>,
    Param = Params2Record<R['param']>
  > = Koa.BaseContext & {
    query: Query
    params: Param
  } & {
    [r in 'req' | 'request']: { body: Body }
  }
  export type Methods = 'get' | 'post' | 'put' | 'delete' | 'del' | 'patch' | 'head'
  export const methods = ['get', 'post', 'put', 'delete', 'del', 'patch', 'head']

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
    string: /[^/?#]+/,
    number: /([-+])?\d+(\.\d+)?/,
    boolean: /0|1|(F|false)|(T|true)/
  }
  type innerParamTypes = typeof paramTypes
  export type InnerParamTypes = {
    [K in keyof innerParamTypes]: innerParamTypes[K]
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
  export type ResolveURL<URL extends string> =
    URL extends `${ infer L }?${ infer R }`
      ? ResolveURL<L> & {
        query: ResolveQuery<R>
      }
      : {
        query: {}
        param: ResolvePath<URL>
      }
  export type ResolvePath<P extends string> =
    P extends `${ infer _L }:${ infer Param }/${ infer R }`
      ? ResolveParam<Param> & ResolvePath<R>
      : P extends `${ infer _L }:${ infer Param }`
        ? ResolveParam<Param>
        : Record<string, ParamType<any>>
  export type ResolveType<T extends string> =
    T extends keyof PathParams ? PathParams[T] : never
  export type ResolveQuery<Q extends string> =
    Q extends `${ infer L }&${ infer R }`
      ? ResolveParam<L> & ResolveQuery<R>
      : ResolveParam<Q>
  export type ResolveParam<P extends string> =
    P extends `${ infer L }(${ infer Type })`
      ? extendObj<{}, L, ParamType<ResolveType<Type>>>
      : extendObj<{}, P, ParamType<Schema<string>>>
  export function resolveURL<URL extends string>(url: URL) {
    const [path, query] = url.split('?')
    return {
      query: resolveQuery(query),
      param: resolvePath(path)
    } as any as ResolveURL<URL>
  }
  export function resolvePath<P extends string>(path: P) {
    let pre = ''
    const params = <Record<string, any>>{}
    for (const pathItem of path.split('/')) {
      if (!pathItem.startsWith(':')) {
        pathItem && (pre += `/${ pathItem }`)
        continue
      }

      const [, name, desc = '(string)'] = pathItem.match(/^:(\w+)(\(\w+\))?/) || []
      params[name] = resolveType(<`(${ keyof PathParams })`>desc, pre)
    }
    return params as any as ResolvePath<P>
  }
  export function resolveType<T extends keyof PathParams = 'string'>(desc: `(${ T })` | '', pre?: string) {
    if (!desc)
      // @ts-ignore
      desc = '(string)'
    const [, type] = desc.match(/^\((.*)\)$/) || []
    if (type in paramTypes)
      return <ParamType<ResolveType<T>>>{
        pre, type,
        // @ts-ignore
        regex: paramTypesRegex[type],
        // @ts-ignore
        schema: paramTypes[type]
      }
    else
      throw new Error(`Unsupported param type: ${ type }`)
  }
  export function resolveQuery<Q extends string>(query: Q) {
    const params = <Record<string, any>>{}
    if (query)
      for (const queryItem of query.split('&')) {
        if (!queryItem.startsWith(''))
          continue

        const [, name, desc = '(string)'] = queryItem.match(/^(\w+)(\(\w+\))?/) || []
        params[name] = resolveType(<`(${ keyof PathParams })`>desc)
      }
    return params as any as ResolveQuery<Q>
  }
  export function resolveSource<Rules extends {
    query: { [name in string]: ParamType<Schema<any>> }
    param: { [name in string]: ParamType<Schema<any>> }
  }, R = {
    query: { [name in keyof Rules['query']]: From<Rules['query'][name]['schema']> }
    param: { [name in keyof Rules['param']]: From<Rules['param'][name]['schema']> }
  }>(source: string, rules: Rules) {
    const result = <Record<string, any>>{}
    result.param = Object.entries(rules.param).reduce((acc, [name, { pre, regex, schema }]) => {
      const param = new RegExp(`${ pre }/(${ regex.source })`)
        .exec(source)?.[1] ?? undefined
      acc[name] = schema(
        schema.meta
          ? schema.meta.processor?.(param) ?? param
          : param
      )
      return acc
    }, {} as any)
    result.query = Object.entries(rules.query).reduce((acc, [name, { regex, schema }]) => {
      const param = new RegExp(`${name}=(${ regex.source })&?`)
        .exec(source)?.[1] ?? undefined
      acc[name] = schema(
        param !== undefined
          ? schema.meta?.processor?.(param) ?? param
          : param
      )
      return acc
    }, {} as any)
    return result as any as R
  }
}
