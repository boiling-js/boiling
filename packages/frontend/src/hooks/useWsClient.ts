import { Messages, resolveMessage, WsClient } from '@boiling/core'

export const S_ID_KEY = 'session:id'
export const S_TK_KEY = 'session:tk'
export const S_NUM_KEY = 'session:s'

let wsClient: WsClient | null = null

type DispatchListener =
  (message: Messages.PickTarget<Messages.Opcodes.DISPATCH>) => void

const dispatchListeners = new Set<DispatchListener>()

export const onDispatch = (listener: DispatchListener) => {
  dispatchListeners.add(listener)
  return () => dispatchListeners.delete(listener)
}

export const identifyWS = async (wsClient: WsClient, token: string, option = {
  resume: false
}) => {
  let s = Number(localStorage.getItem(S_NUM_KEY)) || 0
  let sessionId = localStorage.getItem(S_ID_KEY)

  const helloPkg = await wsClient.waitOnceMessage().resolve([Messages.Opcodes.HELLO])
  if (helloPkg.op !== Messages.Opcodes.HELLO) {
    throw new Error('未成功连接服务器')
  }
  const heartbeatInterval = helloPkg.d.heartbeatInterval

  if (!option.resume) {
    wsClient.send({
      op: Messages.Opcodes.IDENTIFY,
      d: { token }
    })
  } else {
    if (!sessionId)
      throw new Error('没有持久化的 sessionId')

    wsClient.send({
      op: Messages.Opcodes.RESUME,
      d: {
        s,
        token,
        sessionId
      }
    })
  }

  const redyPkg = await wsClient.waitOnceMessage().resolve([Messages.Opcodes.DISPATCH])
  if (redyPkg.t === 'READY') {
    sessionId = redyPkg.d.sessionId
    localStorage.setItem(S_ID_KEY, sessionId)
    localStorage.setItem(S_TK_KEY, token)
  }

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
        s = m.s
        localStorage.setItem('session:s', String(m.s))
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

export const resetWsClient = () => {
  const [_, r] = useWsClient()
  _.ws.close(1000)
  r(null)
  return useWsClient()
}
