import Websocket from 'ws'
import Koa from 'koa'
import websockify from 'koa-websocket'
import { expect } from 'chai'
import { Messages, WsClient, resolveMessage } from '@boiling/core'
import { router as WSRouter, senders } from '../src/routes/ws'
import DAOMain from '../src/dao'
import { UserModel } from '../src/dao/user'
import { Security } from '../src/utils'

process.env.HEARTBEAT_INTERVAL = '5000'

after(() => process.exit(0))

describe('WS', function () {
  const users = <Record<string, [InstanceType<typeof UserModel>, string]>>{
    default: [new UserModel({
      id: 1001,
      username: 'default',
      avatar: 'default',
      passwordHash: Security.encrypt('default')
    }), `Basic ${ Buffer.from('1001:default').toString('base64')}`]
  }
  const {
    PORT = '19849',
    HOST = '127.0.0.1'
  } = {}
  const app = websockify(new Koa())
  app.keys = ['any']
  app.ws.use(WSRouter)

  after(async () => {
    await UserModel.deleteMany()
  })
  before(() => new Promise<void>((resolve, reject) => {
    app.listen(+PORT, HOST, () =>
      DAOMain().then(resolve).catch(reject)
    )
  }).then(async () => {
    await users.default[0].save()
  }))

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
    expect(m2.t).to.equal('READY')
    expect(m2.d).property('user').to.deep.equal({
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
  }

  it('should connect ws server.', async function () {
    this.timeout((process.env?.HEARTBEAT_INTERVAL ?? '20000') + 500)
    const wsClient = new WsClient(new WebSocket(`ws://${ HOST }:${ PORT }/ws`))
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
    this.timeout((process.env?.HEARTBEAT_INTERVAL ?? '20000') + 500)
    const wsClient = new WsClient(new WebSocket(`ws://${ HOST }:${ PORT }/ws`))
    await identifyAndHeartbeat(wsClient)

    // 模拟前端请求了发消息接口后，后端找到对应用户并将消息推送给这个连接上的用户
    // post http://server:port/chat-rooms/[时间戳]:1001:1002/messages { content: 'hello', ... }
    // 后端把这个消息储存到数据库中，再在在线用户列表中找到这个用户把消息发送给他
    senders.get(1001)?.dispatch('MESSAGE', {
      content: 'hello'
    })
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
          expect(m.d).property('user').to.deep.equal({
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
