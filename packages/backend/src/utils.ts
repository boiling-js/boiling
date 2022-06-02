import { createClient } from 'redis'
import { createHash } from 'crypto'
import { SeqModel } from './dao/seq'
import { App } from 'koa-websocket'
import DAOMain from './dao'

namespace Utils {
  export namespace Security {
    export function encrypt(plaintext: string) {
      return createHash('md5')
        .update(plaintext).digest('hex')
    }
    export function match(waitMatch: string, origin: string) {
      return encrypt(waitMatch) === origin
    }
  }
  export namespace Redis {
    export const client = createClient({
      database: 5
    })
    export async function init() {
      client.once('error', console.error)
      await client.connect()
      client.removeListener('error', console.error)
    }
  }
  export function initApp(app: App) {
    app.keys = ['hker92hjkugfkerbl.e[gewkg68']
    const {
      BACKEND_PORT: PORT = '8080',
      BACKEND_HOST: HOST = 'localhost'
    } = process.env
    return new Promise<{
      HOST: string
      PORT: string
      server: ReturnType<typeof app.listen>
    }>((resolve, reject) => {
      const server = app.listen(+PORT, HOST, async () => {
        // connect mongodb database
        try {
          await DAOMain()
          await Redis.init()
        } catch (e) {
          reject(e)
        }
        console.log(`server is running on http://${ HOST }:${ PORT }`)
        resolve({ HOST, PORT, server })
      })
    })
  }
  export namespace Seq {
    export async function auto(n: string, initIndent = 0, step = 1) {
      return SeqModel
        .findOneAndUpdate({ collectionName: n }, {
          $setOnInsert: { initIndent },
          $inc: { seq: step }
        }, { new: true, upsert: true })
        .then(m => m.initIndent + m.seq)
    }
  }
  export type Period = [Date | undefined, Date | undefined]
  export function periodQuery(key: string, period?: Period) {
    if (!period) return {}

    let query
    const [start, end] = period
    if (start && end) {
      query = { $gte: start, $lte: end }
    } else if (start) {
      query = { $gte: start }
    } else if (end) {
      query = { $lte: end }
    } else {
      query = {}
    }
    return { [key]: query }
  }
}

export = Utils
