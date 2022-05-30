import Websocket from 'ws'
import { Middleware } from 'koa-websocket'
import { Messages, Users } from '@boiling/core'
import { UsersService } from '../services/users'
import Utils from '../utils'

class Sender {
  constructor(public ws: Websocket) {
    this.ws = ws
  }
  do(m: Messages.Server) {
    this.ws.send(JSON.stringify(m))
  }
  hello() {
    this.do({
      op: Messages.Opcodes.HELLO,
      d: { heartbeatInterval: Number(process.env.HEARTBEAT_INTERVAL || 600000) }
    })
  }
  ping() {
    this.do({ op: Messages.Opcodes.HEARTBEAT_ACK })
  }
  dispatch<M extends Messages.PickTarget<Messages.Opcodes.DISPATCH>>(t: M['t'], d: M['d']) {
    this.do({
      op: Messages.Opcodes.DISPATCH,
      // @ts-ignore
      t, d
    })
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

export const clients = new Map<number, Sender>()

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
  const sender = new Sender(ws)
  sender.hello()
  new Promise(async (resolve, reject) => {
    let isIdentified = false
    // 五秒内发送鉴权
    setTimeout(() => {
      if (!isIdentified)
        reject(new HttpError('REQUEST_TIMEOUT', '超时未发送鉴权'))
    }, 5000)
    try {
      const { token } = await waitIdentify(ws) || {}
      const [ type, content ] = token?.split(' ') ?? []
      switch (type) {
        case 'Basic':
          const [id, pwd] = Buffer.from(content, 'base64').toString().split(':')
          const user = await UsersService.getOrThrow(+id)
          uid = user.id
          if (!Utils.Security.match(pwd, user!.passwordHash)) {
            throw new HttpError('UNAUTHORIZED', '密码错误')
          }
          sender.do({
            op: Messages.Opcodes.DISPATCH,
            // @ts-ignore
            t: 'READY',
            d: {
              sessionId: '1551321315',
              user: Users.BaseOut(user)
            }
          })
          break
        default:
          throw new HttpError('UNAUTHORIZED', '不支持的协议')
      }
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

    ws.on('message', data => {
      try {
        const m = resolveData<Messages.Client>(data)
        switch (m.op) {
          case Messages.Opcodes.HEARTBEAT:
            isPinged = true
            sender.ping()
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
