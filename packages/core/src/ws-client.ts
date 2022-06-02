import { Messages } from './messages'

const genOnClose = (reject: (reason?: any) => void) =>
  (ev: WebSocketEventMap['close']) => reject(new Error(`ws close: ${ ev.code } ${ ev.reason }`))

export const resolveMessage = <T extends Messages.Opcodes, E = Messages.Server>(
  message: string, opcodes: T[] | undefined = undefined
) => {
  const msg = JSON.parse(message) as Messages.PickTarget<T, E>
  if (opcodes && !opcodes.includes(msg.op))
    throw new Error(`Expected opcodes: [${ opcodes.map(c => Messages.Opcodes[c]).join(', ') }], but got ${ Messages.Opcodes[msg.op] }`)
  return msg
}

const createMessageResolver = (p: Promise<string>) => new Proxy(p as Promise<string> & {
  resolve<T extends Messages.Opcodes, E = Messages.Server>(opcodes: T[]): Promise<Messages.PickTarget<T, E>>
}, {
  get(target, p) {
    if (p === 'resolve')
      return new Proxy(() => {}, {
        apply(_, __, args: any[]): any {
          return target.then(m => resolveMessage(m, ...args))
        }
      })
    // @ts-ignore
    return target[p].bind(target)
  }
})

export class WsClient {
  constructor(public ws: WebSocket) {
    this.ws = ws
  }
  once<K extends keyof WebSocketEventMap>(type: K, listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any, options?: boolean | AddEventListenerOptions) {
    this.ws.addEventListener(type, function _(...args) {
      listener.call(this, ...args)
      this.removeEventListener(type, _)
    }, options)
  }
  send(message: Messages.Client) {
    this.ws.send(JSON.stringify(message))
  }
  waitOnceMessage() {
    return createMessageResolver(new Promise<string>((resolve, reject) => {
      const onClose = genOnClose(reject)

      this.once('message', d => {
        resolve(d.data.toString())
        this.ws.removeEventListener('close', onClose)
      })
      this.once('close', onClose)
    }))
  }
  waitMessage() {
    let reject: undefined | ((reason?: any) => void)
    let resolve: undefined | ((r: { value: string }) => void)

    this.ws.onmessage = function onMessage(d) {
      if (resolve) {
        resolve({ value: d.data.toString() })
        resolve = undefined
      } else {
        setTimeout(onMessage.bind(this, d), 10)
      }
    }
    this.ws.onclose = (code) => {
      reject && reject(new Error(`ws close: ${ code }`))
    }
    return {
      [Symbol.asyncIterator]: () => ({
        next: () => new Promise<{ value: string }>((_, __) => {
          resolve = _
          reject = __
        })
      })
    }
  }
}
