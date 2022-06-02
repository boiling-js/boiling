import Websocket from 'ws'
import Koa from 'koa'
import websockify from 'koa-websocket'
import { expect } from 'chai'
import { Messages, WsClient, resolveMessage } from '@boiling/core'
import { router as WSRouter, clientManager } from '../src/routes/ws'
import { UserModel } from '../src/dao/user'
import { initApp, Security } from '../src/utils'

process.env.HEARTBEAT_INTERVAL = '5000'

after(() => process.exit(0))

describe('WS', function () {
  this.timeout((process.env?.HEARTBEAT_INTERVAL ?? '20000') + 500)
  const users = <Record<string, [InstanceType<typeof UserModel>, string]>>{
    default: [new UserModel({
      id: 1001,
      username: 'default',
      avatar: 'default',
      passwordHash: Security.encrypt('default')
    }), `Basic ${ Buffer.from('1001:default').toString('base64')}`]
  }
  let PORT = '', HOST = ''
  const app = websockify(new Koa())
  app.ws.use(WSRouter)

  after(async () => {
    await UserModel.deleteMany()
  })
  before(async () => {
    const { PORT: p, HOST: h } = await initApp(app)
    PORT = p
    HOST = h
    await users.default[0].save()
  })
  afterEach(() => {
    clientManager.clear()
  })

  const identifyAndHeartbeat = async (wsClient: WsClient) => {
    const m1 = await wsClient.waitOnceMessage().resolve([Messages.Opcodes.HELLO])
    expect(m1.op).to.equal(Messages.Opcodes.HELLO)
    const heartbeatInterval = m1.d.heartbeatInterval

    wsClient.send({
      op: Messages.Opcodes.IDENTIFY,
      d: {
        token: users.default[1]
      }
    })
    const m2 = await wsClient.waitOnceMessage().resolve([Messages.Opcodes.DISPATCH])
    expect(m2.op).to.equal(Messages.Opcodes.DISPATCH)
    expect(m2.s).to.equal(1)
    expect(m2.t).to.equal('READY')
    expect(m2.d).property('user').to.deep.include({
      id: 1001,
      username: 'default',
      avatar: 'default',
      status: 'offline'
    })

    setInterval(() => {
      wsClient.send({
        op: Messages.Opcodes.HEARTBEAT
      })
    }, heartbeatInterval)
    return {
      hello: m1,
      ready: m2
    }
  }

  it('should connect ws server.', async function () {
    const wsClient = new WsClient(new Websocket(`ws://${ HOST }:${ PORT }/ws`) as any)
    await identifyAndHeartbeat(wsClient)

    let c = 0
    for await (const _ of wsClient.waitMessage()) {
      const m = resolveMessage(_, [Messages.Opcodes.HEARTBEAT_ACK])
      if (m.op === Messages.Opcodes.HEARTBEAT_ACK)
        c++
      if (c === 2)
        break
    }
  })
  it('should connect ws server and receive messages.', async function () {
    const wsClient = new WsClient(new Websocket(`ws://${ HOST }:${ PORT }/ws`) as any)
    await identifyAndHeartbeat(wsClient)

    await Promise.all(clientManager.proxyTo(1001)?.map(c => {
      return c?.dispatch('MESSAGE', { content: 'hello' })
    }) ?? [])
    for await (const _ of wsClient.waitMessage()) {
      const m = resolveMessage(_, [
        Messages.Opcodes.HEARTBEAT_ACK,
        Messages.Opcodes.DISPATCH
      ])
      switch (m.op) {
        case Messages.Opcodes.HEARTBEAT_ACK:
          continue
        case Messages.Opcodes.DISPATCH:
          switch (m.t) {
            case 'MESSAGE':
              expect(m.d).to.deep.equal({
                content: 'hello'
              })
              return
          }
          break
      }
    }
  })
  it('should remove client from clients when it close.', async () => {
    const ws = new Websocket(`ws://${ HOST }:${ PORT }/ws`)
    const wsClient = new WsClient(ws as any)
    await identifyAndHeartbeat(wsClient)
    expect(clientManager.proxyTo(1001)).to.have.lengthOf(1)
    ws.close(3001)
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(clientManager.proxyTo(1001)).to.have.lengthOf(0)
  })
  it('should not remove client from clients.', async () => {
    const ws = new Websocket(`ws://${ HOST }:${ PORT }/ws`)
    const wsClient = new WsClient(ws as any)
    await identifyAndHeartbeat(wsClient)
    expect(clientManager.proxyTo(1001)).to.have.lengthOf(1)
    ws.close(3000, 'Debug:resume')
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(clientManager.proxyTo(1001)).to.have.lengthOf(1)
  })
  it('should resume client.', async () => {
    const ws = new Websocket(`ws://${ HOST }:${ PORT }/ws`)
    const wsClient = new WsClient(ws as any)
    const { ready } = await identifyAndHeartbeat(wsClient)
    if (ready.t !== 'READY')
      throw new Error('not ready')

    ws.close(3000, 'Debug:resume')
    await new Promise(resolve => setTimeout(resolve, 100))
    const sessions = clientManager.proxyTo(1001)
    if (!sessions)
      throw new Error('client not found')

    try {
      await Promise.all(sessions.map(
        c => c?.dispatch('MESSAGE', { content: 'hi hi hi0' })
      ).concat(sessions.map(
        c => c?.dispatch('MESSAGE', { content: 'hi hi hi1' })
      )).concat(sessions.map(
        c => c?.dispatch('MESSAGE', { content: 'hi hi hi2' })
      )).concat(sessions.map(
        c => c?.dispatch('MESSAGE', { content: 'hi hi hi3' })
      )))
    } catch (e) {
      const c = clientManager.proxyTo(1001)?.[0]
      expect(await c?.messages(0))
        .to.have.lengthOf(4)
      expect(await c?.messages(1))
        .to.have.lengthOf(3)
    }
    const resumeConnect = async () => {
      const ws = new Websocket(`ws://${ HOST }:${ PORT }/ws`)
      const wsClient = new WsClient(ws as any)

      const m1 = await wsClient.waitOnceMessage().resolve([Messages.Opcodes.HELLO])
      expect(m1.op).to.equal(Messages.Opcodes.HELLO)
      const heartbeatInterval = m1.d.heartbeatInterval

      wsClient.send({
        op: Messages.Opcodes.RESUME,
        d: {
          token: users.default[1],
          sessionId: ready.d.sessionId,
          s: 0
        }
      })

      setInterval(() => {
        wsClient.send({
          op: Messages.Opcodes.HEARTBEAT
        })
      }, heartbeatInterval)
      let acturalContents = ''
      for await (const _ of wsClient.waitMessage()) {
        const m = resolveMessage(_, [
          Messages.Opcodes.HEARTBEAT_ACK,
          Messages.Opcodes.DISPATCH
        ])
        if (m.op === Messages.Opcodes.DISPATCH) {
          console.log(m.t)
          console.log(m.d)
          if (m.t === 'MESSAGE') {
            acturalContents += m.d.content
          }
          if (m.t === 'RESUMED') {
            break
          }
        }
      }
      expect(acturalContents)
        .to.deep.equal('hi hi hi0hi hi hi1hi hi hi2hi hi hi3')
    }
    await resumeConnect()
    if (ready.t === 'READY') {
      clientManager.removeClient(ready.d.sessionId)
    }
  })
  it('should connect ws server and throw `BAD_REQUEST` error.', function (done) {
    const ws = new Websocket(`ws://${ HOST }:${ PORT }/ws`)
    ws.on('open', () => {
      ws.send('*>:"219u0dosqndon')
      ws.on('close', code => {
        expect(code).to.be.eq(4400)
        done()
      })
    })
  })
  it('should connect ws server and throw `NOT_FOUND` error.', function (done) {
    const ws = new Websocket(`ws://${ HOST }:${ PORT }/ws`)
    ws.on('open', () => {
      ws.send(JSON.stringify({
        op: Messages.Opcodes.IDENTIFY,
        d: {
          token: `Basic ${ Buffer.from('1000:default').toString('base64')}`
        }
      }))
      ws.on('close', code => {
        expect(code).to.be.eq(4404)
        done()
      })
    })
  })
  it('should connect ws server and throw `REQUEST_TIMEOUT` error when long time no send ident message.', function () {
    this.timeout(5500)
    return new Promise<void>((resolve, reject) => {
      const ws = new Websocket(`ws://${ HOST }:${ PORT }/ws`)
      ws.on('close', (code, msg) => {
        try {
          expect(code).to.be.eq(4408)
          expect(msg.toString())
            .to.be.eq('超时未发送鉴权')
          resolve()
        } catch (e) {
          reject(e)
        }
      })
    })
  })
  it('should connect ws server and throw `REQUEST_TIMEOUT` error when long time no heart beat.', function () {
    this.timeout((process.env?.HEARTBEAT_INTERVAL ?? '5000') + 500)
    return new Promise<void>((resolve, reject) => {
      const ws = new Websocket(`ws://${ HOST }:${ PORT }/ws`)
      ws.on('open', () => {
        ws.send(JSON.stringify({
          op: Messages.Opcodes.IDENTIFY,
          d: { token: users.default[1] }
        }))
      })
      ws.on('close', (code, msg) => {
        try {
          expect(code).to.be.eq(4408)
          expect(msg.toString())
            .to.be.eq('超时未发送心跳包')

          expect(clientManager.proxyTo(1001), 'client should be removed')
            .to.have.lengthOf(0)
          resolve()
        } catch (e) {
          reject(e)
        }
      })
    })
  })
  it('should connect ws server and throw `REQUEST_TIMEOUT` error when break off.', function () {
    this.timeout((process.env?.HEARTBEAT_INTERVAL ?? '20000') + 500)
    const ws = new Websocket(`ws://${ HOST }:${ PORT }/ws`)
    let heartbeatInterval: number
    return new Promise<void>((resolve, reject) => {
      ws.once('message', d => {
      try {
        const m = <Messages.PickTarget<
          Messages.Opcodes.HELLO
          >>JSON.parse(d.toString())
        expect(m.op).to.equal(Messages.Opcodes.HELLO)
        heartbeatInterval = m.d.heartbeatInterval
        resolve()
      } catch (e) {
        reject(e)
      }
    })
      ws.on('close', code => {
        reject(new Error(`ws close: ${ code }`))
      })
    }).then(() => new Promise<void>((resolve, reject) => {
      ws.send(JSON.stringify({
        op: Messages.Opcodes.IDENTIFY,
        d: {
          token: users.default[1]
        }
      }))
      ws.once('message', d => {
        try {
          const m = <Messages.PickTarget<
            Messages.Opcodes.DISPATCH
            >>JSON.parse(d.toString())
          expect(m.op).to.equal(Messages.Opcodes.DISPATCH)
          expect(m.t).to.equal('READY')
          expect(m.d).property('user').to.deep.include({
            id: 1001,
            username: 'default',
            avatar: 'default',
            status: 'offline'
          })
          resolve()
        } catch (e) {
          reject(e)
        }
      })
    })).then(() => new Promise<void>((resolve, reject) => {
      let c = 0
      setTimeout(() => {
        ws.send(JSON.stringify({
          op: Messages.Opcodes.HEARTBEAT
        }))
      }, heartbeatInterval)
      ws.on('message', d => {
        try {
          const m = <Messages.PickTarget<
            Messages.Opcodes.HEARTBEAT_ACK
            >>JSON.parse(d.toString())
          expect(m.op).to.equal(Messages.Opcodes.HEARTBEAT_ACK)
          c++
          if (c === 2) {
            resolve()
          }
        } catch (e) {
          reject(e)
        }
      })
      ws.on('close', (code, msg) => {
        try {
          expect(code).to.be.eq(4408)
          expect(msg.toString())
            .to.be.eq('超时未发送心跳包')
          resolve()
        } catch (e) {
          reject(e)
        }
      })
    }))
  })
})
