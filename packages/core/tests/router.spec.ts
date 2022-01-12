import Koa from 'koa'
import Schema from 'schemastery'
import { expect } from 'chai'
import { Router } from '@boiling/core'
const { resolvePath, resolveSource } = Router

declare module '@boiling/core' {
  interface PathParams {
    uid: Schema<number | '@me'>
  }
}

describe('Koa Router', () => {
  it('should reveal router middlewares.', () => new Promise<void>(async (resolve, reject) => {
    const isReveal = {
      b: false,
      aNameIsAhh: false,
      cIdIs1001: false
    }
    const shouldDone = () => {
      try {
        Object.entries(isReveal).forEach(([k, v]) =>
          expect(v, `isReveal.${k}`).to.be.eq(true)
        )
        resolve()
      } catch (e) {
        reject(e)
      }
    }
    // const StringInn = Schema.string()
    // const NumberInn = Schema.number()
    const StringOut = Schema.string()
    const NumberOut = Schema.number()
    const r = new Router({
      prefix: '/users' as '/users'
    })
      .get(StringOut, '/a/:name(string)', ctx => {
        if (ctx.params.name === 'ahh')
          isReveal.aNameIsAhh = true
        return '1'
      })
      .get(NumberOut, '/b', () => {
        isReveal.b = true
        return 2
      })
      .get(StringOut, '/c/:id(number)', ctx => {
        if (ctx.params.id === 1001)
          isReveal.cIdIs1001 = true
        return '3'
      })
      // @ts-ignore
      .get(StringOut, '/d', () => 4)
    const createCtx = (method: Router.Methods, path: string) => <Koa.Context>{
      method, path
    }
    const next = () => {}
    expect(await r.middleware(createCtx('get', '/hhh'), () => 'hhh'))
      .to.be.eq('hhh')
    expect(await r.middleware(createCtx('get', '/users/a/ahh'), next))
      .to.be.eq('1')
    expect(await r.middleware(createCtx('get', '/users/b'), next))
      .to.be.eq(2)
    expect(await r.middleware(createCtx('get', '/users/c/1001'), next))
      .to.be.eq('3')
    await r.middleware(createCtx('get', '/users/d'), next)
      .catch(e => expect(e.message).to.be.eq('expected string but got 4'))
      .catch(reject)
    shouldDone()
  }))
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
    describe('Params', () => {
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
  })
})
