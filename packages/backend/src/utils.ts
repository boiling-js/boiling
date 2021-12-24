import { Server } from 'ws'
import { createHash } from 'crypto'
import { SeqModel } from './dao/seq'

namespace Utils {
  export namespace WS {
    export let s: Server | null = null
    export function register(ns: Server) {
      s = ns
    }
  }
  export namespace Security {
    const md5 = createHash('md5')
    export function encrypt(plaintext: string) {
      return md5.update(plaintext).digest('hex')
    }
  }
  export namespace Seq {
    export async function auto(n: string) {
      return await SeqModel
        .findOneAndUpdate({ collectionName: n }, { $inc: { seq: 1 } }, { new: true, upsert: true })
        .then(m => m.seq)
    }
  }
}
export = Utils
