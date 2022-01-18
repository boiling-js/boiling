import Schema from 'schemastery'

declare type Dict<T = any, K extends string = string> = {
  [key in K]?: T
}

declare module 'schemastery' {
  interface Schema<S = any, T = S> {
    processor(processor: (o: any) => S): Schema<S, T>
  }
  namespace Schema {
    type InterfaceS<X extends Dict> = {
      [K in keyof X]: Schema.TypeS<X[K]>
    }
    type InterfaceT<X extends Dict> = {
      [K in keyof X]: Schema.TypeT<X[K]>
    }
    interface Static {
      interface<X extends Dict>(dict: X): Schema<Schema.InterfaceS<X>, Schema.InterfaceT<X>>
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
  Object.entries(dict).forEach(([key, propSchema]) => {
    if (data[key] === undefined) {
      if (propSchema?.meta?.default !== undefined)
        result[key] = propSchema.meta.default
      else
        throw new Error(`${key} is required but not exist`)
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
