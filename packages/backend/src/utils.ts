import { Server } from 'ws'
import { createHash } from 'crypto'

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
}
export = Utils
