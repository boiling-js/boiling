import Websocket from 'ws'
import { v4 as uuid } from 'uuid'
import { Middleware } from 'koa-websocket'
import { Messages, Users } from '@boiling/core'
import { UsersService } from '../services/users'
import Utils from '../utils'

class Sender {
  sessionId?: string
  constructor(public ws: Websocket) {
    this.ws = ws
  }
  do(m: Messages.Server) {
    return new Promise<void>((resolve, reject) => {
      this.ws.send(JSON.stringify(m), (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }
  hello() {
    return this.do({
      op: Messages.Opcodes.HELLO,
      d: { heartbeatInterval: Number(process.env.HEARTBEAT_INTERVAL || 600000) }
    })
  }
  ping() {
    return this.do({ op: Messages.Opcodes.HEARTBEAT_ACK })
  }
  async dispatch<M extends Messages.PickTarget<Messages.Opcodes.DISPATCH>>(t: M['t'], d: M['d']) {
    // TODO 给对应的 redis 中的 session 储存对应的消息 id
    if (this.sessionId) {
    }
    await this.do({
      op: Messages.Opcodes.DISPATCH,
      // @ts-ignore
      t, d
    })
    // TODO 在发送给了前端并且没有报错后，把对应的消息 id 从 redis 中删除
    if (this.sessionId) {
    }
  }
}

const resolveData = <T>(data: Websocket.RawData) => {
  try {
    return <T>JSON.parse(data.toString())
  } catch (e) {
    throw new HttpError('BAD_REQUEST', '错误的请求')
  }
}

const waitIdentify = <T extends Messages.PickTarget<Messages.Opcodes.IDENTIFY, Messages.Client>>(
  ws: Websocket
) => new Promise<T['d']>((resolve, reject) => {
  // 只接受一次
  ws.once('message', data => {
    try {
      const m = resolveData<T>(data)
      if (m.op !== Messages.Opcodes.IDENTIFY) {
        reject(new HttpError('BAD_REQUEST', '你必须先发送一个 IDENTIFY 消息'))
      }
      resolve(m.d)
    } catch (e) {
      reject(e)
    }
  })
})

/**
 * TODO
 * uid -> sessionId
 * sessionId -> client
 *
 * send message to uid -> sessionId -> client
 */
export const clients = new Map<number, Sender>()

export const sessions = new Map<string, number>()

/**
 * 基础流程：
 * 服务端发送 hello 数据包给客户端，其中包含了心跳包的间隔时间
 * 客户端接收到 hello 数据包后，发送鉴权数据包给服务端
 * 鉴权通过后，服务端再下发其他的数据包给客户端
 * 客户端按照 hello 包中的心跳包间隔时间，发送心跳包给服务端
 * 服务端收到心跳包后，发送心跳包响应给客户端
 *
 * 异常处理：
 * 1. 鉴权不通过，服务端会主动断开连接
 * 2. 多次未发送心跳包，服务端会主动断开连接
 * 3. 鉴权不通过不会下发其他数据包
 * 4. 错误的数据包，服务端会主动断开连接
 */
export const router: Middleware = async (context, next) => {
  if (!context.url.startsWith('/ws'))
    return await next()
  const { websocket: ws } = context
  let uid: number | undefined
  const sessionId = uuid()
  const sender = new Sender(ws)
  await sender.hello()
  new Promise(async (resolve, reject) => {
    let isIdentified = false
    // 五秒内发送鉴权
    setTimeout(() => {
      if (!isIdentified)
        reject(new HttpError('REQUEST_TIMEOUT', '超时未发送鉴权'))
    }, 5000)
    try {
      // TODO 处理 Resume 包，并返回对应的 token
      const { token } = await waitIdentify(ws) || {}
      const [ type, content ] = token?.split(' ') ?? []
      let user: Awaited<ReturnType<typeof UsersService.getOrThrow>> | null = null
      switch (type) {
        case 'Basic':
          const [id, pwd] = Buffer.from(content, 'base64').toString().split(':')
          user = await UsersService.getOrThrow(+id)
          uid = user.id
          if (!Utils.Security.match(pwd, user!.passwordHash)) {
            throw new HttpError('UNAUTHORIZED', '密码错误')
          }
          break
        default:
          throw new HttpError('UNAUTHORIZED', '不支持的协议')
      }
      await sender.do({
        op: Messages.Opcodes.DISPATCH,
        t: 'READY',
        d: {
          sessionId,
          user: Users.BaseOut(user)
        }
      })
    } catch (e) {
      reject(e)
    }
    isIdentified = true

    // 要求客户端按照 hello 包中的心跳包间隔时间，发送心跳包给服务端，服务端收到心跳包后，发送心跳包响应给客户端
    // 如果多次未发送心跳包，服务端会主动断开连接
    let isPinged = false
    setInterval(() => {
      if (!isPinged) {
        reject(new HttpError('REQUEST_TIMEOUT', '超时未发送心跳包'))
      } else {
        isPinged = false
      }
    }, Number(process.env.HEARTBEAT_INTERVAL || 600000) + 1000)

    ws.on('message', async data => {
      try {
        const m = resolveData<Messages.Client>(data)
        switch (m.op) {
          case Messages.Opcodes.HEARTBEAT:
            isPinged = true
            await sender.ping()
            break
          default:
            throw new HttpError('UNPROCESSABLE_ENTITY', '不支持的op类型')
        }
      } catch (e) {
        reject(e)
      }
    })
    ws.onclose = e => {
      let isDelete = true
      if (e.code === 3000 && e.reason.startsWith('Debug')) {
        if (e.reason === 'Debug:resume') {
          isDelete = false
        }
      }
      isDelete && uid
        && clients.delete(uid!)
    }
    uid && clients.set(uid, sender)
  }).catch(e => {
    if (e instanceof HttpError)
      ws.close(e.code + 4000, e.msg)
    else {
      ws.close(4500, '未知错误')
      console.error(e)
    }
    uid && clients.delete(uid!)
  })
}
