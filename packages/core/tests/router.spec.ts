import Koa from 'koa'
import Schema from 'schemastery'
import { expect, use } from 'chai'
import cap from 'chai-as-promised'
import { Router } from '@boiling/core'
const { resolveURL, resolveType, resolvePath, resolveSource, resolveQuery } = Router

use(cap)

declare module '@boiling/core' {
  interface PathParams {
    uid: Schema<number | '@me'>
  }
}

describe('Router', () => {
  describe('Middleware', () => {
    const next = () => {}
    const createCtx = (method: Router.Methods, url: string, body?: any) => <Koa.Context><any>{
      method, url, path: url.split('?')[0],
      req: { body }, request: { body }
    }
    it('should reveal router middlewares.', async () => {
      const r = new Router()
        .get('/0', () => 0)
        .get(Schema.number(), '/a', () => 2)
        // @ts-ignore
        .get(Schema.string(), '/b', () => 4)
        .get(Schema.number(), Schema.number(), '/c', ctx => ctx.request.body)
      const middleware = r.middleware()
      await expect(middleware(createCtx('get', '/h'), () => 'none'))
        .to.be.eventually.eq('none')
      await expect(middleware(createCtx('get', '/h'), next))
        .to.be.eventually.eq(undefined)
      await expect(middleware(createCtx('get', '/0'), next))
        .to.be.eventually.eq(0)
      await expect(middleware(createCtx('get', '/a'), next))
        .to.be.eventually.eq(2)
      await expect(middleware(createCtx('get', '/b'), next))
        .to.be.eventually.rejectedWith('expected string but got 4')
      await expect(middleware(createCtx('get', '/c', 1), next))
        .to.be.eventually.eq(1)
      expect(middleware.bind(r, createCtx('get', '/c', '1'), next))
        .to.be.throw('expected number but got 1')
    })
    it('should reveal router middlewares with router prefix.', async () => {
      const r = new Router({ prefix: '/users' as '/users' })
        .get(Schema.number(), '/a', () => 2)
        .post(Schema.string(), '/:b', ({ params }) => params.b)
        .post(Schema.string(), '/:c/d', ({ params }) => params.c)
      const middleware = r.middleware()
      await expect(middleware(createCtx('get', '/n'), next))
        .to.be.eventually.eq(undefined)
      await expect(middleware(createCtx('get', '/users/a'), next))
        .to.be.eventually.eq(2)
      await expect(middleware(createCtx('get', '/users/a'), next))
        .to.be.eventually.eq(2)
      await expect(middleware(createCtx('post', '/users/1'), next))
        .to.be.eventually.eq('1')
      await expect(middleware(createCtx('post', '/users/1/d'), next))
        .to.be.eventually.eq('1')
      await expect(middleware(createCtx('post', '/users/:asdi:12sd/d'), next))
        .to.be.eventually.eq(':asdi:12sd')
    })
    it('should reveal router middlewares with params.', async () => {
      const r = new Router({ prefix: '/users' as '/users' })
        .get(Schema.string(), '/a/:name(string)', ctx => ctx.params.name)
        .get(Schema.number(), '/b/:id(number)', ctx => ctx.params.id)
      const middleware = r.middleware()
      await expect(middleware(createCtx('get', '/users/a/ahh'), next))
        .to.be.eventually.eq('ahh')
      await expect(middleware(createCtx('get', '/users/b/100'), next))
        .to.be.eventually.eq(100)
    })
    it('should reveal router middlewares with query.', async () => {
      const r = new Router({ prefix: '/users' as '/users' })
        .get(Schema.string(), '/a?name', ctx => ctx.query.name)
      const middleware = r.middleware()
      await expect(middleware(createCtx('get', '/users/a?name=ahh'), next))
        .to.be.eventually.eq('ahh')
      await expect(middleware(createCtx('get', '/users/a?name='), next))
        .to.be.eventually.eq(undefined)
    })
    it('should reveal router middlewares by interface.', async () => {
      const r = new Router({ prefix: '/users' as '/users' })
        .get(Schema.interface({
          name: Schema.string()
        }), Schema.any(), '/a', ctx => {
          return ctx.request.body.name
        })
      await expect(r.middleware()(createCtx('get', '/users/a', { name: 'ahh' }), next))
        .to.be.eventually.eq('ahh')
    })
  })
  describe('URL', () => {
    it('should resolve source.', () => {
      expect(resolveSource('/foo/hi', resolveURL('/foo/:foo')))
        .property('param').property('foo')
        .to.be.eq('hi')
      expect(resolveSource('/foo/bar', resolveURL('/foo/bar')))
        .property('param').to.be.empty
    })
    it('should resolve source with types.', () => {
      const n = resolveURL('/foo/:foo(number)')
      Object.entries({
        '/foo/123': 123,
        '/foo/0.123': 0.123,
        '/foo/+23': 23,
        '/foo/-23': -23
      }).forEach(([path, value]) => {
        expect(resolveSource(path, n).param.foo, path)
          .to.be.eq(value)
      })
    })
    it('should resolve source with query.', () => {
      const result = resolveSource('/foo/str?bar=str', resolveURL('/foo/:foo?bar&baz'))
      expect(result)
        .property('param').property('foo')
        .to.be.eq('str')
      expect(result)
        .property('query').property('bar')
        .to.be.eq('str')
      expect(result)
        .property('query').property('baz')
        .to.be.eq(undefined)
    })
    it('should resolve url.', () => {
      const url = resolveURL('/foo/:foo?bar')
      url.query.bar.schema('hi')
      url.param.foo.schema('hi')
    })
    it('should resolve url with type.', () => {
      const url = resolveURL('/foo/:foo(number)?bar(number)')
      url.query.bar.schema(1)
      url.param.foo.schema(2)
    })
    it('should resolve multi param url.', () => {
      const url = resolveURL('/foo/:foo(number)/:fuu?bar(number)&baz')
      url.query.bar.schema(1)
      url.query.baz.schema('1')
      url.param.foo.schema(2)
      url.param.fuu.schema('2')
    })
    describe('Type', () => {
      it('should resolve no type.', () => {
        const t0 = resolveType('')
        const strArr = ['1', 'hi:12:12', 'sad.,i7']
        strArr.forEach(str => {
          t0.schema(str)
          expect(t0.regex.test(str))
            .to.be.eq(true)
        })
        // @ts-ignore
        expect(t0.schema.bind(null, 1))
          .to.throw('expected string but got 1')
      })
      it('should resolve number type.', () => {
        const t0 = resolveType('(number)')
        t0.schema(1)
        ;['1', '1.111', '-10', '-10.01'].forEach(v => {
          expect(t0.regex.test(v))
            .to.be.eq(true)
        })
        // @ts-ignore
        expect(t0.schema.bind(null, '1'))
          .to.throw('expected number but got 1')
      })
      it('should resolve boolean type.', () => {
        const t0 = resolveType('(boolean)')
        t0.schema(true)
        ;['true', 'false', '0'].forEach(v => {
          expect(t0.regex.test(v))
            .to.be.eq(true)
        })
        // @ts-ignore
        expect(t0.schema.bind(null, '1'))
          .to.throw('expected boolean but got 1')
      })
      it('should resolve extend type.', () => {
        Router.extendParamTypes('uid', Schema.union([Schema.number(), '@me']), /(@me)|(([-+])?\d+(\.\d+)?)/)
        const t0 = resolveType('(uid)')
        t0.schema(1)
        t0.schema('@me')
        ;['1', '1.111', '-10', '-10.01', '@me'].forEach(v => {
          expect(t0.regex.test(v))
            .to.be.eq(true)
        })
        expect(t0.regex.test('foo'))
          .to.be.eq(false)
        // @ts-ignore
        expect(t0.schema.bind(null, '1'))
          .to.throw('expected number | "@me" but got "1"')
      })
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
      it('should resolve path with type.', () => {
        const p0 = resolvePath('/foo/:foo(string)')
        p0.foo.schema('1')
        expect(p0.foo.regex.test('ahhh'))
          .to.be.eq(true)
        // @ts-ignore
        expect(p0.foo.schema.bind(null, 1))
          .to.throw('expected string but got 1')
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
