import { Messages, resolveMessage, Users, WsClient } from '@boiling/core'
import Websocket from 'ws'

let wsClient: WsClient | null = null

export const identifyWS = async (wsClient: WsClient, id: string, pwd: Users.Login['password']) => {
  const m1 = await wsClient.waitOnceMessage().resolve([Messages.Opcodes.HELLO])
  if (m1.op !== Messages.Opcodes.HELLO) {
    throw new Error('未成功连接服务器')
  }
  const heartbeatInterval = m1.d.heartbeatInterval

  wsClient.send({
    op: Messages.Opcodes.IDENTIFY,
    d: {
      token: `Basic ${ Buffer.from(id + ':' + pwd).toString('base64') }`
    }
  })
  const m2 = await wsClient.waitOnceMessage().resolve([Messages.Opcodes.DISPATCH])

  setInterval(() => {
    wsClient.send({
      op: Messages.Opcodes.HEARTBEAT
    })
  }, heartbeatInterval)

  for await (const _ of wsClient.waitMessage()) {
    const m = resolveMessage(_, [Messages.Opcodes.HEARTBEAT_ACK])
  }
}

export const useWsClient = (): [WsClient, (v: typeof wsClient) => void] => {
  if (wsClient === null) {
    wsClient = new WsClient(new Websocket('/api/ws'))
  }
  return [wsClient, v => wsClient = v]
}
