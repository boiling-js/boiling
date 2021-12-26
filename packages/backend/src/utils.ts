import { Server } from 'ws'
import { createHash } from 'crypto'
import { SeqModel } from './dao/seq'

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
  export namespace WS {
    export let s: Server | null = null
    export function register(ns: Server) {
      s = ns
    }
  }
  export namespace Seq {
    export async function auto(n: string, initIndent = 0, step = 1) {
      return SeqModel
        .findOneAndUpdate({ collectionName: n }, {
          $setOnInsert: { seq: initIndent },
          $set: { $inc: { seq: step } }
        }, { new: true, upsert: true })
        .then(m => m.seq)
    }
  }
}

export = Utils
