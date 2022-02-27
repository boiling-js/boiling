import Websocket from 'ws'
import { Messages, WsClient } from '@boiling/core'
import { expect } from 'chai'
import { resolveMessage } from '../src/ws-client'

after(() => {
  process.exit(0)
})

describe('Ws Client', function () {
  let ws: Websocket
  const wss = new Websocket.Server({ port: 8080 })
  wss.on('connection', _ => {
    ws = _
  })
  const wsClient = new WsClient(new Websocket('ws://localhost:8080'))

  it('should wait once message.', async function () {
    ws && ws.send('hi')
    expect(await wsClient.waitOnceMessage())
      .to.be.equal('hi')
  })
  it('should wait once message and resolve it.', async function () {
    ws && ws.send(JSON.stringify({
      op: Messages.Opcodes.HELLO,
      d: { heartbeatInterval: 1000 }
    }))
    const m = await wsClient.waitOnceMessage().resolve([ Messages.Opcodes.HELLO ])
    expect(m.op).to.be.equal(Messages.Opcodes.HELLO)
    expect(m.d.heartbeatInterval).to.be.equal(1000)
  })
  it('should wait once message and throw error.', async function () {
    ws && ws.send(JSON.stringify({
      op: Messages.Opcodes.HELLO,
      d: { heartbeatInterval: 1000 }
    }))
    try {
      await wsClient.waitOnceMessage().resolve([ Messages.Opcodes.DISPATCH ])
    } catch (e) {
      if (e instanceof Error) {
        expect(e.message).to.be.equal('Expected opcodes: [DISPATCH], but got HELLO')
      } else {
        throw e
      }
    }
  })
  it('should wait each messages.', async function () {
    const messages = [{
      op: Messages.Opcodes.HELLO,
      d: { heartbeatInterval: 1000 }
    }, {
      op: Messages.Opcodes.HEARTBEAT_ACK
    }]
    ws && messages.forEach(m => ws.send(JSON.stringify(m)))

    let i = 0
    for await (const _ of wsClient.waitMessage()) {
      const m = resolveMessage(_, [ Messages.Opcodes.HELLO, Messages.Opcodes.HEARTBEAT_ACK ])
      expect(m.op).to.be.equal(messages[i++].op)
      if (i === messages.length) {
        break
      }
    }
  })
})
