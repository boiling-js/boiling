import { Server } from 'ws'

export namespace Utils {
  export namespace WS {
    export let s: Server | null = null
    export function register(ns: Server) {
      s = ns
    }
  }
}
