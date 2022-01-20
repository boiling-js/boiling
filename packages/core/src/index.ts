import Schema from 'schemastery'
import './schemastery-ext'
import { Message } from './message'

export const Pagination = <Item extends Schema>(item: Item) => Schema.interface({
  count: Schema.number(),
  items: Schema.array(item)
})
export interface Pagination<Item> {
  count: number
  items: Item[]
}
export interface SearchQuery {
  key: string
  num?: number
  page?: number
}

export namespace Users {
  /** 基础数据 */
  export const Base = Schema.interface({
    /** 用户唯一 id */
    id: Schema.number(),
    /** 用户名 */
    username: Schema.string(),
    /** 加密的用户密码 */
    avatar: Schema.string(),
    /** 用户头像 */
    passwordHash: Schema.string()
  })
  export type Base = Schema.InferS<typeof Base>
  /** 基础数据出口 */
  export const BaseOut = Schema.Omit(Base, ['passwordHash'])
  export type BaseOut = Schema.InferS<typeof BaseOut>

  /** 数据库模型 */
  export const Model = Users.Base.and(Schema.interface({
    /** 用户好友 */
    friends: Schema.array(Users.Friend),
    /** 用户标签 */
    tags: Schema.array(Schema.string()),
    /** 聊天室 id 列表 */
    chatRooms: Schema.array(Schema.string())
  }))
  export type Model = Schema.InferS<typeof Model>
  /** 用户数据出口 */
  export const Out = Schema.Omit(Model, ['passwordHash'])
  export type Out = Schema.InferS<typeof Out>

  /** 好友 */
  export const Friend = Schema.Pick(Base, ['id']).and(Schema.interface({
    /** 好友备注 */
    remark: Schema.string(),
    /** 好友标签 */
    tags: Schema.array(Schema.string())
  }))
  export type Friend = Schema.InferS<typeof Friend>
  /** 好友数据出口 */
  export const FriendOut = BaseOut.and(Friend)
  export type FriendOut = Schema.InferS<typeof FriendOut>

  export const Register = Schema.Omit(Base, ['id', 'passwordHash', 'avatar']).and(Schema.interface({
    /** 用户密码 */
    password: Schema.string()
  }))
  export type Register = Schema.InferS<typeof Register>
  export const Status = Schema.interface({
    /** 用户状态 */
    status: Schema.union<'online' | 'leave' | 'offline'>([
      'online', 'leave', 'offline'
    ]),
    /** 用户密码 */
    password: Schema.string()
  })
  export type Status = Schema.InferS<typeof Status>
}

export namespace ChatRoom {
  /**
   * 聊天室不实际存储数据，只是用于描述聊天室的基本信息
   *
   * 聊天室的数据可以通过聊天室的 id 来获取生成
   */
  export const Base = Schema.interface({
    /**
     * id
     *
     * 当聊天室为私聊、讨论组时
     *   格式为 `member0Id-member1Id[createdAt]`
     *   创建者位于第一个
     * 当聊天室为 channel 时
     *   格式为 `channelId`
     */
    id: Schema.string(),
    /**
     * 头像
     *
     * 当聊天室为私聊、讨论组时，该结构 avatar 为成员头像组合
     * 当聊天室为 channel 时，该结构 avatar 为 guild 头像
     */
    avatar: Schema.string(),
    /** 成员列表 */
    members: Schema.array(Users.BaseOut),
    /** 创建时间 */
    createdAt: Schema.string(),
    /** 消息列表 */
    messages: Schema.array(Message.Model)
  })
  export type Base = Schema.InferS<typeof Base>
}

export * from './message'
export * from './api'
export * from './router'
export { Utils } from './utils'
