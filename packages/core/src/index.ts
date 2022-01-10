import { ParsedUrlQuery } from 'querystring'

export interface Pagination<Item> {
  count: number
  items: Item[]
}
export interface SearchQuery extends ParsedUrlQuery {
  key: string
  page?: string
  num?: string
}
export namespace Users {
  export interface Base {
    /** 用户唯一 id */
    id: number
    /** 用户名 */
    username: string
    /** 加密的用户密码 */
    passwordHash: string
    /** 用户头像 */
    avatar: string
  }
  export interface Model extends Base {
    /** 用户好友 */
    friends: Friend[]
    /** 用户标签 */
    tags: string[]
  }
  export type BaseOut = Omit<Base, 'passwordHash'>
  export type Out = Omit<Model, 'passwordHash'>
  export type FriendOut = BaseOut & Friend
  export type Register = Omit<Base, 'id' | 'passwordHash' | 'avatar'> & {
    /** 用户密码 */
    password: string
  }
  export type Status = Omit<Base, 'id' | 'username' | 'avatar' | 'passwordHash'> & {
    /** 用户密码 */
    password: string
    /** 用户状态 */
    status: 'online' | 'leave' | 'offline'
  }
  export type Friend = Pick<Base, 'id'> & {
    /** 好友标签 */
    tags?: string[]
    /** 好友备注 */
    remark?: string
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
export * from './router'
export { Utils } from './utils'
