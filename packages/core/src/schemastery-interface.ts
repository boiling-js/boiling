import Schema from 'schemastery'

type Dict<T = any, K extends string = string> = {
  [key in K]?: T
}
type KeysOfType<T, SelectedType> = {
  [key in keyof T]: SelectedType extends T[key] ? key : never
}[keyof T]
type Optional<T> = Partial<Pick<T, KeysOfType<T, undefined>>>
type Required<T> = Omit<T, KeysOfType<T, undefined>>
export type OptionalUndefined<T> = Optional<T> & Required<T>

declare module 'schemastery' {
  interface Schema<S = any, T = S> {
    processor(processor: (o: any) => S): Schema<S, T>
    optional(): Schema<
      Schema.TypeS<S> | undefined, Schema.TypeT<T> | undefined
      >
    default(value: T): Schema<S | undefined, T>
  }
  namespace Schema {
    type InferS<X> = X extends Schema<infer S, unknown> ? S : never
    type InferT<X> = X extends Schema<unknown, infer T> ? T : never
    interface Meta {
      optional?: boolean
    }
    type InterfaceS<X extends Dict> = OptionalUndefined<{
      [K in keyof X]: Schema.TypeS<X[K]>
    }>
    type InterfaceT<X extends Dict> = OptionalUndefined<{
      [K in keyof X]: Schema.TypeT<X[K]>
    }>
    interface Static {
      interface<X extends Dict>(dict: X): Schema<Schema.InterfaceS<X>, Schema.InterfaceT<X>>
    }
  }
}

Schema.prototype.optional = function () {
  if (this.meta === undefined)
    this.meta = <Schema.Meta>{}
  this.meta.optional = true
  return this
}
const oldDefault = Schema.prototype.default
Schema.prototype.default = function (value) {
  if (this.meta === undefined)
    this.meta = <Schema.Meta>{}
  this.meta.optional = true
  return oldDefault.call(this, value)
}

function isNullable(value: any) {
  return value === null || value === undefined
}

Schema.extend('interface', (data, schema, _strict) => {
  if (!schema)
    throw new Error('schema is not exist')

  const { dict = {} } = schema
  const result = <Record<string, any>>{}
  Object.entries(dict).forEach(([key, propSchema]) => {
    if (data[key] === undefined) {
      if (propSchema?.meta?.default !== undefined)
        result[key] = propSchema.meta.default
      else {
        if (!propSchema?.meta?.optional)
          throw new Error(`${key} is required but not exist`)
      }
    } else
      result[key] = data[key]

    try {
      const [value, adapted] = Schema.resolve(data[key], propSchema)
      if (!isNullable(adapted))
        data[key] = adapted
      result[key] = value
    } catch (e) {
      throw new Error(`${key}.${ e }`)
    }
  })
  return [result]
})

Object.assign(Schema, {
  interface(inn: Dict<Schema<any, any>, string>) {
    const schema = new Schema({ type: 'interface' })
    schema.toString = (({ dict }: Schema) => {
      if (!dict)
        throw new Error('Schema.interface: dict is not exist')

      if (Object.keys(dict).length === 0) return '{}'
      return `{ ${Object.entries(dict).map(([key, inner]) => {
        return `${key}: ${ inner ? inner.toString() : undefined }`
      }).join(', ')} }`
    }).bind(null, schema)
    schema.dict = inn
    return schema
  }
})
