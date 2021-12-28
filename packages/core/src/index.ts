export namespace Users {
  export interface Model {
    /** 用户唯一 id */
    id: number
    /** 用户名 */
    username: string
    /** 加密的用户密码 */
    passwordHash: string
  }
  export type Out = Omit<Model, 'passwordHash'>
  export type Register = Omit<Model, 'id' | 'passwordHash'> & {
    /** 用户密码 */
    password: string
  }
  export type Status = Omit<Model, 'id' | 'username' | 'passwordHash'> & {
    /** 用户密码 */
    password: string
    /** 用户状态 */
    status: 'online' | 'leave' | 'offline'
  }
}
export namespace Message {
  export interface Resp {
    id: number
  }
}
export namespace WS {
  export type Event = {
    t: 'MESSAGE'
    p: Message.Resp
  }
}

export * from './api'
export { Utils } from './utils'
