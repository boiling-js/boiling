import Websocket from 'ws'
import { v4 as uuid } from 'uuid'
import { Middleware } from 'koa-websocket'
import { Messages, Users } from '@boiling/core'
import { UsersService } from '../services/users'
import Utils, { Redis } from '../utils'

const env = Object.defineProperty(<{ interval: number }>{}, 'interval', {
  get() {
    return Number(process.env.HEARTBEAT_INTERVAL ?? 600000)
  }
})

class Sender {
  s = 1
  sessionId?: string
  get mKey() {
    return `session:${this.sessionId}:messages`
  }
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
  ready(sessionId: string, user: Users.BaseOut) {
    return this.do({
      op: Messages.Opcodes.DISPATCH,
      s: this.s++,
      t: 'READY',
      d: {
        sessionId,
        user: Users.BaseOut(user)
      }
    })
  }
  hello() {
    return this.do({
      op: Messages.Opcodes.HELLO,
      d: { heartbeatInterval: env.interval }
    })
  }
  ping() {
    return this.do({ op: Messages.Opcodes.HEARTBEAT_ACK })
  }
  async dispatch<M extends Messages.PickTarget<Messages.Opcodes.DISPATCH>>(
    t: M['t'], d: M['d'], options = { store: true }
  ) {
    const m = {
      op: Messages.Opcodes.DISPATCH,
      s: this.s++,
      t, d
    } as M
    const mStr = JSON.stringify(m)
    if (this.sessionId && options.store) {
      await Redis.client.rPush(this.mKey, mStr)
    }
    await this.do(m)
  }
  async messages(sN: number) {
    return (
      await Redis.client.lRange(this.mKey, sN, -1)
    ).map(m => JSON.parse(m))
  }
}

const resolveData = <T>(data: Websocket.RawData) => {
  try {
    return <T>JSON.parse(data.toString())
  } catch (e) {
    throw new HttpError('BAD_REQUEST', '错误的请求')
  }
}

const waitIdentify = <T extends Messages.PickTarget<
  Messages.Opcodes.IDENTIFY | Messages.Opcodes.RESUME, Messages.Client
>>(
  ws: Websocket
) => new Promise<{
  s?: number
  token: T['d']['token']
  sessionId?: string
}>((resolve, reject) => {
  // 只接受一次
  ws.once('message', data => {
    try {
      const m = resolveData<T>(data)
      if ([Messages.Opcodes.IDENTIFY, Messages.Opcodes.RESUME].includes(m.op)) {
        resolve(m.d)
      } else {
        reject(new HttpError('BAD_REQUEST', '你必须先发送一个 IDENTIFY/RESUME 消息'))
      }
    } catch (e) {
      reject(e)
    }
  })
})

export const clientManager = {
  userSessions: new Map<number, string[]>(),
  clients: new Map<string, Sender>(),
  async initFromRedis() {
    const keys = await Redis.client.keys('user:*:sessions')
    keys
      .map(k => k.split(':')[1])
      .map(async uid => {
        this.userSessions.set(
          Number(uid),
          await Redis.client.sMembers(`user:${uid}:sessions`)
        )
      })
  },
  appendClient(
    uid: number, sessionId: string, sender: Sender
  ) {
    sender.sessionId = sessionId
    this.clients.set(sessionId, sender)
    let sessions = this.userSessions.get(uid)
    if (!sessions) {
      sessions = [sessionId]
    } else {
      sessions.push(sessionId)
    }
    this.userSessions.set(uid, [...new Set(sessions)])
    Redis.client.sAdd(`user:${uid}:sessions`, sessionId)
  },
  removeClient(sessionId: string) {
    let uId: string | undefined
    if (this.clients.has(sessionId)) {
      this.clients.delete(sessionId)
    }
    this.userSessions.forEach((sessions, userId) => {
      const index = sessions.indexOf(sessionId)
      if (index > -1) {
        sessions.splice(index, 1)
        uId = userId.toString()
      }
    })
    Redis.client.sRem(`user:${uId}:sessions`, sessionId)
    Redis.client.lPop(`session:${sessionId}:messages`)
  },
  clear() {
    this.clients.clear()
    this.userSessions.clear()
  },
  proxyTo(uid: number) {
    return this.userSessions.get(uid)
      ?.map(sessionId => this.clients.get(sessionId))
  }
}

export const router: Middleware = async (context, next) => {
  if (!context.url.startsWith('/ws'))
    return await next()
  const { websocket: ws } = context
  let uid: number | undefined
  let sessionId = uuid()
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
      const { s, token, sessionId: oldSId } = await waitIdentify(ws) || {}

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
      if (oldSId !== undefined && s !== undefined) {
        sender.s = s
        sessionId = oldSId
        sender.sessionId = sessionId
        const messages = await sender.messages(s)
        for (const m of messages) {
          await sender.do(m)
        }
        await sender.dispatch('RESUMED', {}, { store: false })
      } else {
        await sender.ready(sessionId, user)
      }
    } catch (e) {
      reject(e)
    }
    isIdentified = true

    let isPinged = false
    setInterval(() => {
      if (!isPinged) {
        reject(new HttpError('REQUEST_TIMEOUT', '超时未发送心跳包'))
      } else {
        isPinged = false
      }
    }, env.interval + 1000)

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
      isDelete
        && clientManager.removeClient(sessionId)
    }
    uid && clientManager.appendClient(uid, sessionId, sender)
  }).catch(e => {
    if (e instanceof HttpError)
      ws.close(e.code + 4000, e.msg)
    else {
      ws.close(4500, '未知错误')
      console.error(e)
    }
    clientManager.removeClient(sessionId)
  })
}
