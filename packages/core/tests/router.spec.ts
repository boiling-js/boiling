import Koa from 'koa'
import Schema from 'schemastery'
import { expect, use } from 'chai'
import cap from 'chai-as-promised'
import { Router } from '@boiling/core'
const { resolvePath, resolveSource, resolveQuery } = Router

use(cap)

declare module '@boiling/core' {
  interface PathParams {
    uid: Schema<number | '@me'>
  }
}

describe('Router', () => {
  const next = () => {}
  const createCtx = (method: Router.Methods, path: string, body?: any) => <Koa.Context>{
    method, path, body
  }
  describe('Middleware', () => {
    it('should reveal router middlewares.', async () => {
      const r = new Router()
        .get(Schema.number(), '/a', () => 2)
        // @ts-ignore
        .get(Schema.string(), '/b', () => 4)
        .get(Schema.number(), Schema.number(), '/c', ctx => ctx.body)
      await expect(r.middleware(createCtx('get', '/h'), () => 'none'))
        .to.be.eventually.eq('none')
      await expect(r.middleware(createCtx('get', '/h'), next))
        .to.be.eventually.eq(undefined)
      await expect(r.middleware(createCtx('get', '/a'), next))
        .to.be.eventually.eq(2)
      await expect(r.middleware(createCtx('get', '/b'), next))
        .to.be.eventually.rejectedWith('expected string but got 4')
      await expect(r.middleware(createCtx('get', '/c', 1), next))
        .to.be.eventually.eq(1)
      expect(r.middleware.bind(r, createCtx('get', '/c', '1'), next))
        .to.be.throw('expected number but got 1')
    })
    it('should reveal router middlewares with router prefix.', async () => {
      const r = new Router({ prefix: '/users' as '/users' })
        .get(Schema.number(), '/a', () => 2)
      await expect(r.middleware(createCtx('get', '/n'), next))
        .to.be.eventually.eq(undefined)
      await expect(r.middleware(createCtx('get', '/users/a'), next))
        .to.be.eventually.eq(2)
    })
    it('should reveal router middlewares with params.', async () => {
      const r = new Router({ prefix: '/users' as '/users' })
        .get(Schema.string(), '/a/:name(string)', ctx => ctx.params.name)
        .get(Schema.number(), '/b/:id(number)', ctx => ctx.params.id)
      await expect(r.middleware(createCtx('get', '/users/a/ahh'), next))
        .to.be.eventually.eq('ahh')
      await expect(r.middleware(createCtx('get', '/users/b/100'), next))
        .to.be.eventually.eq(100)
    })
  })
  describe('URL', () => {
    it('should resolve source.', () => {
      expect(resolveSource('/foo/hi', resolvePath('/foo/:foo')).foo)
        .to.be.eq('hi')
      const n = resolvePath('/foo/:foo(number)')
      Object.entries({
        '/foo/123': 123,
        '/foo/0.123': 0.123,
        '/foo/+23': 23,
        '/foo/-23': -23
      }).forEach(([path, value]) => {
        expect(resolveSource(path, n).foo, path)
          .to.be.eq(value)
      })
      const b = resolvePath('/foo/:foo(boolean)')
      Object.entries({
        '/foo/true': true,
        '/foo/false': false,
        '/foo/0': false
      }).forEach(([path, value]) => {
        expect(resolveSource(path, b).foo, path)
          .to.be.eq(value)
      })
      expect(resolveSource('/foo/bar', resolvePath('/foo/bar')))
        .to.be.empty
    })
    describe('Path', () => {
      it('should resolve path.', () => {
        const p0 = resolvePath('/foo/:foo')
        p0.foo.schema('1')
        expect(p0.foo.regex.test('ahhh'))
          .to.be.eq(true)
        // @ts-ignore
        expect(p0.foo.schema.bind(null, 1))
          .to.throw('expected string but got 1')
      })
      it('should resolve path which param type is string.', () => {
        const p0 = resolvePath('/foo/:foo(string)')
        p0.foo.schema('1')
        expect(p0.foo.regex.test('ahhh'))
          .to.be.eq(true)
        // @ts-ignore
        expect(p0.foo.schema.bind(null, 1))
          .to.throw('expected string but got 1')
      })
      it('should resolve path which param type is number.', () => {
        const p0 = resolvePath('/foo/:foo(number)')
        p0.foo.schema(1)
        ;['1', '1.111', '-10', '-10.01'].forEach(v => {
          expect(p0.foo.regex.test(v))
            .to.be.eq(true)
        })
        // @ts-ignore
        expect(p0.foo.schema.bind(null, '1'))
          .to.throw('expected number but got 1')
      })
      it('should resolve path which param type is boolean.', () => {
        const p0 = resolvePath('/foo/:foo(boolean)')
        p0.foo.schema(true)
        ;['true', 'false', '0'].forEach(v => {
          expect(p0.foo.regex.test(v))
            .to.be.eq(true)
        })
        // @ts-ignore
        expect(p0.foo.schema.bind(null, '1'))
          .to.throw('expected boolean but got 1')
      })
      it('should extend path params.', () => {
        Router.extendParamTypes('uid', Schema.union([Schema.number(), '@me']), /(@me)|(([-+])?\d+(\.\d+)?)/)
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
      it('should resolve multi params.', () => {
        const p0 = resolvePath('/foo/:foo(string)/:bar(number)')
        p0.foo.schema('1')
        expect(p0.foo.regex.test('ahhh'))
          .to.be.eq(true)
        // @ts-ignore
        expect(p0.foo.schema.bind(null, 1))
          .to.throw('expected string but got 1')
        p0.bar.schema(1)
        ;['1', '1.111', '-10', '-10.01'].forEach(v => {
          expect(p0.bar.regex.test(v))
            .to.be.eq(true)
        })
        // @ts-ignore
        expect(p0.bar.schema.bind(null, '1'))
          .to.throw('expected number but got 1')
      })
    })
    describe('Query', () => {
      it('should resolve query.', () => {
        const q0 = resolveQuery('foo')
        q0.foo.schema('1')
        expect(q0.foo.regex.test('ahhh'))
          .to.be.eq(true)
        // @ts-ignore
        expect(q0.foo.schema.bind(null, 1))
          .to.throw('expected string but got 1')
      })
      it('should resolve query with type.', () => {
        const q0 = resolveQuery('foo(string)')
        q0.foo.schema('1')
        expect(q0.foo.regex.test('ahhh'))
          .to.be.eq(true)
        // @ts-ignore
        expect(q0.foo.schema.bind(null, 1))
          .to.throw('expected string but got 1')
      })
      it('should resolve multi query.', () => {
        const q0 = resolveQuery('foo(string)&bar(number)')
        q0.foo.schema('1')
        expect(q0.foo.regex.test('ahhh'))
          .to.be.eq(true)
        // @ts-ignore
        expect(q0.foo.schema.bind(null, 1))
          .to.throw('expected string but got 1')
        q0.bar.schema(1)
        ;['1', '1.111', '-10', '-10.01'].forEach(v => {
          expect(q0.bar.regex.test(v))
            .to.be.eq(true)
        })
        // @ts-ignore
        expect(q0.bar.schema.bind(null, '1'))
          .to.throw('expected number but got 1')
      })
    })
  })
})
