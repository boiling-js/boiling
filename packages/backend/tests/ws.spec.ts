import Websocket from 'ws'
import Koa from 'koa'
import websockify from 'koa-websocket'
import { expect } from 'chai'
import { Messages } from '@boiling/core'
import { router as WSRouter } from '../src/routes/ws'
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

  it('should connect ws server.', function () {
    this.timeout((process.env?.HEARTBEAT_INTERVAL ?? '20000') + 500)
    let heartbeatInterval: number
    const ws = new Websocket(`ws://${ HOST }:${ PORT }/ws`)
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
      setInterval(() => {
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
    }))
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
  it('should connect ws server and throw `UNAUTHORIZED` error.', function (done) {
    const ws = new Websocket(`ws://${ HOST }:${ PORT }/ws`)
    ws.on('open', () => {
      ws.send(JSON.stringify({
        op: Messages.Opcodes.IDENTIFY,
        d: {
          token: 'Basic none'
        }
      }))
      ws.on('close', code => {
        expect(code).to.be.eq(4401)
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
