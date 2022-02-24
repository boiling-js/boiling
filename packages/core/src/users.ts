import Schema from 'schemastery'

export namespace Users {
  export const Status = Schema.union<'online' | 'leave' | 'offline' | 'noDisturb'>([
    'online', 'leave', 'offline', 'noDisturb'
  ])
  export type Status = Schema.InferS<typeof Status>
  /** 基础数据 */
  export const Base = Schema.interface({
    /** 用户唯一 id */
    id: Schema.number(),
    /** 用户名 */
    username: Schema.string(),
    /** 加密的用户密码 */
    avatar: Schema.string(),
    /** 用户头像 */
    passwordHash: Schema.string(),
    /** 用户状态 */
    status: Status.optional()
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
  /** 登录 */
  export const Login = Schema.interface({
    /** 用户状态 */
    status: Status,
    /** 用户密码 */
    password: Schema.string()
  })
  export type Login = Schema.InferS<typeof Login>
}
