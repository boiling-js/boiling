import Websocket from 'ws'
import { Middleware } from 'koa-websocket'
import { Message } from '@boiling/core'

class Sender {
  constructor(public ws: Websocket) {
    this.ws = ws
  }
  do(m: Message.Server) {
    this.ws.send(JSON.stringify(m))
  }
  hello() {
    this.do({
      op: Message.Opcodes.HELLO,
      d: { heartbeatInterval: 600000 }
    })
  }
  ping() {
    this.do({ op: Message.Opcodes.HEARTBEAT_ACK })
  }
  dispatch<M extends Message.PickTarget<Message.Opcodes.DISPATCH>>(t: M['t'], d: M['d']) {
    this.do({
      op: Message.Opcodes.DISPATCH,
      // @ts-ignore
      t, d
    })
  }
}

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
 */
export const router: Middleware = async (context, next) => {
  if (!context.url.startsWith('/ws'))
    return await next()
  const { websocket: ws } = context
  const sender = new Sender(ws)
  sender.hello()
  new Promise(((resolve, reject) => {
    let isIdentified = false
    // 五秒内发送鉴权
    setTimeout(() => {
      if (!isIdentified)
        reject(new HttpError('REQUEST_TIMEOUT', '超时未发送鉴权'))
    }, 5000)
    ws.on('message', data => {
      try {
        const m = <Message.Client>JSON.parse(data.toString())
        switch (m.op) {
          case Message.Opcodes.HEARTBEAT:
            sender.ping()
            break
          case Message.Opcodes.IDENTIFY:
            const { d } = m
            if (d.token === 'Basic hhhhhhh')
              isIdentified = true
            else {
              reject(new HttpError('UNAUTHORIZED', '鉴权失败'))
              return
            }
            break
        }
      } catch (e) {
        reject(new HttpError('BAD_REQUEST', '错误的请求'))
      }
    })
  })).catch(e => {
    if (e instanceof HttpError)
      ws.close(e.code + 4000, e.msg)
    else {
      ws.close(4500, '未知错误')
      console.error(e)
    }
  })
}
