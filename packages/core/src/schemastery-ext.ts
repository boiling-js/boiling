import Schema from 'schemastery'
import './schemastery-interface'

declare module 'schemastery' {
  interface Schema {
    or<S extends Schema>(s: S): Schema<
      Schema.TypeT<this> | Schema.TypeT<S>,
      Schema.TypeS<this> | Schema.TypeS<S>
    >
    and<S extends Schema>(s: S): Schema<
      Schema.TypeT<this> & Schema.TypeT<S>,
      Schema.TypeS<this> & Schema.TypeS<S>
    >
  }
  namespace Schema {
    interface Static {
      Pick<S extends Schema, Keys extends keyof Schema.TypeT<S>>(s: S, keys: Keys[]): Schema<
        Pick<Schema.TypeS<S>, Keys>, Pick<Schema.TypeT<S>, Keys>
      >
      Omit<S extends Schema, Keys extends keyof Schema.TypeS<S>>(s: S, keys: Keys[]): Schema<
        Omit<Schema.TypeS<S>, Keys>, Omit<Schema.TypeT<S>, Keys>
      >
    }
  }
}
// @ts-ignore
Schema.prototype.and = function(s) {
  const result = <Record<string, any>>{}
  if (s.type !== 'interface' || !s.dict)
    throw new Error('Schema.and: s must be an interface')
  for (const key in this.dict) {
    result[key] = this.dict[key]
  }
  for (const key in s.dict) {
    if (!result[key])
      result[key] = s.dict[key]
  }
  return Schema.interface(result)
}
Schema.prototype.or = function (s) {
  return Schema.union([this, s])
}
// @ts-ignore
Schema.Pick = function(s, keys) {
  const result = <Record<string, any>>{}
  if (!s.dict)
    throw new Error('pick() can only be used on dictionaries')

  const objKeys = Object.keys(s.dict)
  for (const key of keys) {
    if (typeof key !== 'string')
      throw new Error('pick() keys must be strings')

    if (!objKeys.includes(key))
      throw new Error(`pick() key ${key} not found in schema`)

    result[key] = s.dict[key]
  }
  return Schema.interface(result)
}
// @ts-ignore
Schema.Omit = function(s, keys) {
  const result = <Record<string, any>>{}
  if (!s.dict)
    throw new Error('omit() can only be used on dictionaries')

  const objKeys = Object.keys(s.dict)
  for (const key of objKeys) {
    // @ts-ignore
    if (!keys.includes(key))
      result[key] = s.dict[key]
  }
  return Schema.interface(result)
}
