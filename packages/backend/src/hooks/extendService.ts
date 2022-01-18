import mongoose from 'mongoose'

interface Service<M extends mongoose.Model<any>> {
  Model: M
  [k: string]: any
}

type PickTargetType<T, Type> = {
  [key in keyof T]: T[key] extends Type ? key : never
}

export default function extendService<
  S extends Service<any>,
  M extends keyof PickTargetType<S, (...args: any) => any>,
  R = ReturnType<S[M]>
  >(service: S, property: M, callback: (pre: R) => R): S {
  return new Proxy(service, {
    // @ts-ignore
    get(target, prop: M) {
      const pre = target[prop]
      if (prop === property && typeof pre === 'function') {
        return (...args: Parameters<S[M]>) => callback(pre(...args))
      }
      return target[prop]
    }
  })
}
