import { Utils } from './utils'
import axios, { AxiosResponse, AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import qs from 'qs'

type TwoParamsMethod = 'get' | 'delete' | 'head' | 'options'
type ThreeParamsMethod = 'post' | 'put' | 'patch'
interface TwoParamsRequest {
  <T, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<T>
}
interface ThreeParamsRequest {
  <T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T>
}
export type InnerAxiosInstance = Omit<AxiosInstance, 'request' | TwoParamsMethod | ThreeParamsMethod> & {
  request<T = any, D = any>(config: AxiosRequestConfig<D>): Promise<T>
} & {
  [K in TwoParamsMethod]: TwoParamsRequest
} & {
  [K in ThreeParamsMethod]: ThreeParamsRequest
}
export type QueryPromise<T, Q> = Promise<T> & {
  query(q: Q): Promise<T>
}

type promiseMethod = 'then' | 'catch' | 'finally'
const promiseMethods = [ 'then', 'catch', 'finally' ]

const getPromiseProp = (p: Promise<any>, prop: promiseMethod) => p[prop].bind(p)

const requestProxy = (a: Api, path: string, cPath = ''): Function => new Proxy(() => {}, {
  get(_, prop: string) {
    if (promiseMethods.includes(prop))
      return getPromiseProp(
        a.$request.get(path + cPath), prop as promiseMethod)
    else {
      switch (prop as 'add' | 'del' | 'upd' | 'query') {
        case 'add':
          return (d: any) => a.$request.post(path + cPath, d)
        case 'del':
          return () => a.$request.delete(path + cPath)
        case 'upd':
          return (d: any) => a.$request.patch(path + cPath, d)
        case 'query':
          return new Proxy(() => {}, {
            apply(target, thisArg, [ query ]): any {
              return a.$request.get(`${path}${cPath}?${qs.stringify(query)}`)
            }
          })
      }
      return requestProxy(a, path, `/${prop}`)
    }
  },
  apply(_, __, [id, ..._args]) {
    return requestProxy(a, `${path + Utils.String.pluralize(cPath)}/${id}`)
  }
})

export const attachApi = <T extends Api>(a: T) => new Proxy(a, {
  get(target, path: keyof Api) {
    if (path in target) return target[path]
    return requestProxy(a, `/${path}`)
  }
})

export class Api {
  readonly host: string
  readonly events = <{
    [K in keyof Api.EventMap]: Api.EventMap[K]
  }>{}
  $request: InnerAxiosInstance

  constructor(host: string) {
    this.host = host
    this.$request = this.getRequest()
  }

  on<E extends keyof Api.EventMap>(event: E, cb: Api.EventMap[E]) {
    this.events[event] = cb
  }

  emit<E extends keyof Api.EventMap>(event: E, ...args: Parameters<Api.EventMap[E]>) {
    if (event in this.events)
      // @ts-ignore
      return this.events[event](...args)
    switch (event) {
      case 'resp.fulfilled':
        return (<AxiosResponse>args[0]).data
      case 'resp.rejected':
        throw args[0]
      default:
        return
    }
  }

  protected getRequest() {
    const a = axios.create({
      baseURL: this.host,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    // @ts-ignore
    a.interceptors.response.use(this.emit.bind(this, 'resp.fulfilled'), this.emit.bind(this, 'resp.rejected'))
    return a
  }
}

export namespace Api {
  export interface EventMap {
    'resp.fulfilled': (resp: AxiosResponse) => void
    'resp.rejected': (error: AxiosError<{}>) => void
  }
}
