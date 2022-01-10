import Schema from 'schemastery'
import { Router } from '@boiling/core'
import resolvePath = Router.resolvePath
import { expect } from 'chai'

declare module '@boiling/core' {
  interface PathParams {
    uid: Schema<number | '@me'>
  }
}

describe('Koa Router', () => {
  it('should none.', () => {
    // const StringInn = Schema.string()
    // const NumberInn = Schema.number()
    const StringOut = Schema.string()
    const NumberOut = Schema.number()
    const r = new Router({
      prefix: '/users' as '/users'
    })
      .get(StringOut, '/a/:name(number)', ctx => {
        ctx.params.name
      })
      .get(NumberOut, '/b', ctx => {
      })
  })
  it('should resolve path.', () => {
    const p0 = resolvePath('/foo/:foo')
    p0.foo('1')
    // @ts-ignore
    expect(p0.foo.bind(null, 1))
      .to.throw('expected string but got 1')
    const p1 = resolvePath('/foo/:foo(string)')
    p1.foo('1')
    // @ts-ignore
    expect(p1.foo.bind(null, 1))
      .to.throw('expected string but got 1')
    const p2 = resolvePath('/foo/:foo(number)')
    p2.foo(1)
    // @ts-ignore
    expect(p2.foo.bind(null, '1'))
      .to.throw('expected number but got 1')
  })
  it('should extend path params.', function () {
    Router.extendParamTypes('uid', Schema.union([Schema.number(), '@me']))
    const p0 = resolvePath('/foo/:foo(uid)')
    p0.foo(1)
    p0.foo('@me')
    // @ts-ignore
    expect(p0.foo.bind(null, '1'))
      .to.throw('expected function () { [native code] } but got "1"')
  })
})
