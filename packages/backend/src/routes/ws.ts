import { Middleware } from 'koa-websocket'
import { Messages } from '@boiling/core/src/message'
import { WebSocket } from 'ws'

const users = new Map<string, WebSocket>()

export const router: Middleware = async (context, next) => {
  if (!/^\/ws.*/.test(context.url))
    return await next()

  const { websocket: ws, request: req } = context

  const { authorization } = Object.assign({
    authorization:
      req.headers['proxy-authorization'] ||
      req.headers.authorization ||
      req.query.authorization ||
      ''
  }, req.headers)
  if (!authorization) {
    ws.close(4003, 'Unauthorized')
    return
  }

  let selfUid = ''
  // 从请求头中获取用户名与密码
  const [type, token] = authorization?.split(' ') as ['Basic', string]
  switch (type) {
    case 'Basic':
      const [uname, pwd] = Buffer.from(token, 'base64').toString().split(':')
      selfUid = `${ uname }@${ req.socket.remoteAddress }`
      break
    default:
      ws.close(4003, 'Unauthorized')
      return
  }

  users.set(selfUid, ws)
  // 连接建立时发送当前在线用户列表
  ws.send(JSON.stringify({
    t: 'HELLO',
    p: Array.of(...users.keys())
  }))

  ws.on('message', m => {
    const message = JSON.parse(m.toString()) as Messages.Client
    switch (message.t) {
      case 'MESSAGE':

        break
      // 客户端触发 发送文件 事件，请求他人同意接收文件
      case 'SEND_FILE':
        const { uid: target, filename } = message.p
        users.get(target)?.send(JSON.stringify({
          t: 'RECEIVE_FILE',
          p: { uid: selfUid, filename }
        }))
        break
      // 客户端触发 接收文件 事件，允许他人向当前用户发送文件
      case 'RECEIVE_FILE':
        users.get(message.p)?.send(JSON.stringify({
          t: 'SEND_FILE',
          p: selfUid
        }))
        break
    }
  })
  ws.on('close', () => {
    console.log(`[I] ${ selfUid } is disconnected.`)
    users.delete(selfUid)
  })

  ws.on('message', m => {
    console.log(m.toString())
  })
}
