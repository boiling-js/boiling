import Schema from 'schemastery'

declare type Dict<T = any, K extends string = string> = {
  [key in K]?: T
}

declare module 'schemastery' {
  interface Schema<S = any, T = S> {
    processor(processor: (o: any) => S): Schema<S, T>
  }
  namespace Schema {
    type ObjectS<X extends Dict> = {
      [K in keyof X]?:  Schema.TypeS<X[K]>
    } & Dict
    type ObjectT<X extends Dict> = {
      [K in keyof X]?:  Schema.TypeT<X[K]>
    } & Dict
    interface Meta<T = any> {
      processor: (o: any) => T
    }
    interface Static {
      interface<X extends Dict>(dict: X): Schema<Schema.ObjectS<X>, Schema.ObjectT<X>>
    }
  }
}

function isNullable(value: any) {
  return value === null || value === undefined
}

Schema.extend('interface', (data, schema, _strict) => {
  if (!schema)
    throw new Error('schema is not exist')

  const { dict = {} } = schema
  const result = <Record<string, any>>{}
  Object.entries(dict).forEach(([key, schema]) => {
    if (data[key] === undefined)
      return

    const [value, adapted] = Schema.resolve(data[key], schema)
    if (!isNullable(adapted)) data[key] = adapted
    result[key] = value
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
    schema.meta && (schema.meta.default = {})
    return schema
  }
})
