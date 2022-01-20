import Schema from 'schemastery'
import { Users } from './index'

export namespace Message {
  /** 储存在数据库的消息 */
  export const Model = Schema.interface({
    /** id */
    id: Schema.string(),
    /** 发送者 */
    sender: Users.BaseOut,
    /** 内容 */
    content: Schema.string(),
    /** 发送时间 */
    createdAt: Schema.string()
  })
  export type Model = Schema.InferS<typeof Model>
  export enum Opcodes {
    /**
     * Server
     * 当客户端与网关建立 ws 连接之后，网关下发的第一条消息
     */
    HELLO = 0,
    /**
     * Client
     * 客户端发送心跳
     */
    HEARTBEAT = 1,
    /**
     * Server
     * 当发送心跳成功之后，就会收到该消息
     */
    HEARTBEAT_ACK = 2,
    /**
     * Server
     * 服务端进行消息推送
     */
    DISPATCH = 3,
    /**
     * Client
     * 客户端发送鉴权
     */
    IDENTIFY = 4,
  }
  type DP<T extends string, D extends any> = {
    op: Opcodes.DISPATCH
    t: T
    d: D
  }
  interface Events {
    User:
      // 好友请求
      DP<'FRIEND_REQUEST', Users.BaseOut> |
      // 好友接受了请求
      DP<'FRIEND_REQUEST_ACCEPTED', Users.BaseOut> |
      // 好友拒绝了请求
      DP<'FRIEND_REQUEST_REJECTED', Users.BaseOut>
    Guilds:
      // 加入频道
      DP<'GUILD_CREATE', {}> |
      // 退出频道
      DP<'GUILD_DELETE', {}> |
      // 频道信息更新
      DP<'GUILD_UPDATE', {}> |
      // 新增频道成员
      DP<'GUILD_MEMBER_CREATE', {}> |
      // 频道成员退出
      DP<'GUILD_MEMBER_DELETE', {}> |
      // 频道成员更新
      DP<'GUILD_MEMBER_UPDATE', {}>
    ChatRoom:
      // 用户开始输入
      DP<'USER_INPUT_START', Users.BaseOut> |
      // 用户停止输入
      DP<'USER_INPUT_END', Users.BaseOut> |
      // 聊天室接收到新消息
      DP<'MESSAGE', Model>
  }
  export type Server = {
    op: Opcodes.HELLO
    d: {
      /**
       * 客户端需要按照该心跳周期发送心跳包来保持连接
       *
       * 单位 ms
       */
      heartbeatInterval: number
    }
  } | {
    op: Opcodes.HEARTBEAT_ACK
  } | DP<'READY', {
    sessionId: string
    user: Users.BaseOut
  }>
    | Events['ChatRoom'] | Events['User'] | Events['Guilds']
  export type Client = {
    op: Opcodes.HEARTBEAT
  } | {
    op: Opcodes.IDENTIFY
    d: {
      token: string
    }
  }
  export type PickTarget<T extends Opcodes, E = Server> = E extends { op: T } ? E : never
}
