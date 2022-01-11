import Koa from 'koa'
import Schema from 'schemastery'
import { expect } from 'chai'
import { Router } from '@boiling/core'
import resolvePath = Router.resolvePath

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
      .get(StringOut, '/a/:name(string)', ctx => {
        ctx.params.name
      })
      .get(NumberOut, '/b', ctx => {
      })
    r.dispatch(<Koa.Context>{  path: '/a/foo' }, async () => {})
  })
  it('should resolve path.', () => {
    const p0 = resolvePath('/foo/:foo')
    p0.foo.schema('1')
    expect(p0.foo.regex.test('ahhh'))
      .to.be.eq(true)
    // @ts-ignore
    expect(p0.foo.schema.bind(null, 1))
      .to.throw('expected string but got 1')
    const p1 = resolvePath('/foo/:foo(string)')
    p1.foo.schema('1')
    expect(p1.foo.regex.test('ahhh'))
      .to.be.eq(true)
    // @ts-ignore
    expect(p1.foo.schema.bind(null, 1))
      .to.throw('expected string but got 1')
    const p2 = resolvePath('/foo/:foo(number)')
    p2.foo.schema(1)
    ;['1', '1.111', '-10', '-10.01'].forEach(v => {
      expect(p2.foo.regex.test(v))
        .to.be.eq(true)
    })
    // @ts-ignore
    expect(p2.foo.schema.bind(null, '1'))
      .to.throw('expected number but got 1')
  })
  it('should extend path params.', function () {
    Router.extendParamTypes('uid', Schema.union([Schema.number(), '@me']), /(@me)|((\-|\+)?\d+(\.\d+)?)/)
    const p0 = resolvePath('/foo/:foo(uid)')
    p0.foo.schema(1)
    p0.foo.schema('@me')
    ;['1', '1.111', '-10', '-10.01', '@me'].forEach(v => {
      expect(p0.foo.regex.test(v))
        .to.be.eq(true)
    })
    expect(p0.foo.regex.test('foo'))
      .to.be.eq(false)
    // @ts-ignore
    expect(p0.foo.schema.bind(null, '1'))
      .to.throw('expected function () { [native code] } but got "1"')
  })
})
