import { Messages, resolveMessage, Users, WsClient } from '@boiling/core'

let wsClient: WsClient | null = null

type DispatchListener =
  (message: Messages.PickTarget<Messages.Opcodes.DISPATCH>) => void

const dispatchListeners = new Set<DispatchListener>()

export const onDispatch = (listener: DispatchListener) => {
  dispatchListeners.add(listener)
}

export const identifyWS = async (wsClient: WsClient, id: string, pwd: Users.Login['password']) => {
  const helloPkg = await wsClient.waitOnceMessage().resolve([Messages.Opcodes.HELLO])
  if (helloPkg.op !== Messages.Opcodes.HELLO) {
    throw new Error('未成功连接服务器')
  }
  const heartbeatInterval = helloPkg.d.heartbeatInterval

  wsClient.send({
    op: Messages.Opcodes.IDENTIFY,
    d: {
      token: `Basic ${ btoa(id + ':' + pwd) }`
    }
  })
  const identifyPkg = await wsClient.waitOnceMessage().resolve([Messages.Opcodes.DISPATCH])

  setInterval(() => {
    wsClient.send({
      op: Messages.Opcodes.HEARTBEAT
    })
  }, heartbeatInterval)

  for await (const _ of wsClient.waitMessage()) {
    const m = resolveMessage(_, [
      Messages.Opcodes.HEARTBEAT_ACK,
      Messages.Opcodes.DISPATCH
    ])
    switch (m.op) {
      case Messages.Opcodes.DISPATCH:
        dispatchListeners.forEach(listener => listener(m))
        break
      case Messages.Opcodes.HEARTBEAT_ACK:
        break
    }
  }
}

export const useWsClient = (): [WsClient, (v: typeof wsClient) => void] => {
  if (wsClient === null) {
    wsClient = new WsClient(new WebSocket(`ws://${location.host}/api/ws`))
  }
  return [wsClient, v => wsClient = v]
}
