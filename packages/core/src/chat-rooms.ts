import Schema from 'schemastery'
import { Messages } from './messages'
import { Users } from './users'

export namespace ChatRooms {
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
    messages: Schema.array(Messages.Model)
  })
  export type Base = Schema.InferS<typeof Base>
}
