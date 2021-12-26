import { Server } from 'ws'
import { SeqModel } from './dao/seq'

namespace Utils {
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
