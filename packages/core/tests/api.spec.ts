import MockAdapter from 'axios-mock-adapter'
import { AxiosInstance } from 'axios'
import { expect, use } from 'chai'
import cap from 'chai-as-promised'

import { Api, attachApi, QueryPromise } from '../src/api'

use(cap)

describe('Api', function () {
  interface Foo {
    get guilds(): QueryPromise<any[], { key: string }> & {
      add(nGuild: string): Promise<string>
    }
    guild(id: string): Promise<any> & {
      upd(nGuild: string): Promise<string>
      del(): Promise<string>

      get members(): Promise<any[]>
      member(id: string): Promise<any>
    }
  }
  class Foo extends Api {
    constructor() {
      super('http://www.example.com')

      return attachApi(this)
    }
  }
  const foo = new Foo()

  it('should travel simple property and simple method.', async () => {
    const id = '123'
    new MockAdapter(foo.$request as AxiosInstance)
      .onGet('/guilds')
      .replyOnce(200, 'test0')
      .onGet(`/guilds/${ id }`)
      .replyOnce(200, 'test1')

    expect(await foo.guilds)
      .to.equal('test0')
    expect(await foo.guild(id))
      .to.equal('test1')
  })

  it('should travel nest property and nest method.', async () => {
    const guildId = '123', memberId = '456'
    new MockAdapter(foo.$request as AxiosInstance)
      .onGet(`/guilds/${ guildId }/members`)
      .replyOnce(200, 'test0')
      .onGet(`/guilds/${ guildId }/members/${ memberId }`)
      .replyOnce(200, 'test1')

    expect(await foo.guild(guildId).members)
      .to.equal('test0')
    expect(await foo.guild(guildId).member(memberId))
      .to.equal('test1')
  })

  it('should travel other method request.', async () => {
    const reqAdd = 'content'
    const guildId = '123'
    new MockAdapter(foo.$request as AxiosInstance)
      .onPost('/guilds', reqAdd)
      .replyOnce(200, 'test0')
      .onPatch(`/guilds/${ guildId }`, reqAdd)
      .replyOnce(200, 'test1')
      .onDelete(`/guilds/${ guildId }`)
      .replyOnce(200, 'test2')

    expect(await foo.guilds.add(reqAdd))
      .to.equal('test0')
    expect(await foo.guild(guildId).upd(reqAdd))
      .to.equal('test1')
    expect(await foo.guild(guildId).del())
      .to.equal('test2')
  })

  it('should listen `resp.fulfilled` and `resp.rejected` event.', async () => {
    new MockAdapter(foo.$request as AxiosInstance)
      .onGet('/guilds')
      .replyOnce(200, 'test0')
      .onGet('/guilds')
      .replyOnce(403, 'test1')
      .onGet('/guilds')
      .replyOnce(404, 'test2')
      .onGet('/guilds')
      .replyOnce(404, 'test2')

    foo.on('resp.fulfilled', resp => {
      return resp.data + '-event'
    })
    foo.on('resp.rejected', error => {
      switch (error.response?.status) {
        case 403:
          return error.response.data + '-403event'
        case 404:
          throw new Error(error.response.data + '-404event')
      }
    })

    expect(await foo.guilds)
      .to.equal('test0-event')
    expect(await foo.guilds)
      .to.equal('test1-403event')
    try {
      await foo.guilds
    } catch (error) {
      if (error instanceof Error)
        expect(error.message)
          .to.equal('test2-404event')
      else
        throw error
    }
    await foo.guilds.catch(error => {
      expect(error.message).to.equal('test2-404event')
    })
  })

  it('should parse query string.', async () => {
    new MockAdapter(foo.$request as AxiosInstance)
      .onGet('/guilds?key=test')
      .replyOnce(200, 'test')
    expect(await foo.guilds.query({ key: 'test' }))
      .to.equal('test')
  })
})
