import Websocket from 'ws'
import Koa from 'koa'
import websockify from 'koa-websocket'
import { expect } from 'chai'
import { Messages } from '@boiling/core'
import DAOMain from '../src/dao'
import { router as WSRouter } from '../src/routes/ws'
import { UserModel } from '../src/dao/user'

after(() => process.exit(0))

describe('WS', function () {
  const users = <Record<string, InstanceType<typeof UserModel>>>{
    default: new UserModel({
      id: 1001,
      username: 'default',
      avatar: 'default',
      passwordHash: 'default'
    })
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
    await users.default.save()
  }))

  it('should connect ws server.', function () {
    return new Promise<void>((resolve, reject) => {
      const ws = new Websocket(`ws://${ HOST }:${ PORT }/ws`)
      ws.on('open', () => {
        ws.send(JSON.stringify({
          op: Messages.Opcodes.IDENTIFY,
          d: {
            token: 'Basic hhhhhhh'
          }
        }))
      })
      ws.on('message', m => {
        console.log(m)
        resolve()
      })
      ws.on('close', code => {
        reject(new Error(`ws close: ${ code }`))
      })
    })
  })
  it('should connect ws server and throw `REQUEST_TIMEOUT` error.', function (done) {
    this.timeout(5500)
    const ws = new Websocket(`ws://${ HOST }:${ PORT }/ws`)
    ws.on('close', code => {
      expect(code).to.be.eq(4408)
      done()
    })
  })
})
