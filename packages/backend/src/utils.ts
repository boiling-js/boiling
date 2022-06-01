import { createClient } from 'redis'
import { createHash } from 'crypto'
import { SeqModel } from './dao/seq'
import { App } from 'koa-websocket'
import DAOMain from './dao'

namespace Utils {
  export function initApp(app: App) {
    const {
      BACKEND_PORT: PORT = '8080',
      BACKEND_HOST: HOST = 'localhost'
    } = process.env
    return {
      HOST, PORT,
      server: app.listen(+PORT, HOST, async () => {
        // connect mongodb database
        try {
          await DAOMain()
        } catch (e) {
          console.error(e)
          process.exit(1)
        }
        console.log(`server is running on http://${ HOST }:${ PORT }`)
      })
    }
  }
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
    export async function init() {
      const client = createClient()
      const onError = (err: any) => {
        console.log('Redis Client Error', err)
      }
      client.once('error', onError)
      await client.connect()
      client.removeListener('error', onError)
    }
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
