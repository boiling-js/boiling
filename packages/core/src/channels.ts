import Schema from 'schemastery'

export namespace Channels {
  export const MemberMeta = Schema.interface({
    /** id */
    id: Schema.number(),
    /** name */
    name: Schema.string().optional(),
    /** rules */
    rules: Schema.array(Schema.string()).default([])
  })
  export type MemberMeta = Schema.InferS<typeof MemberMeta>
  export const ChatRoomMeta = Schema.interface({
    /** id */
    id: Schema.string(),
    /**
     * 从属的子标题
     */
    subTitle: Schema.string().optional()
  })
  export type ChatRoomMeta = Schema.InferS<typeof ChatRoomMeta>
  export const Model = Schema.interface({
    /** id */
    id: Schema.string(),
    /** 名称 */
    name: Schema.string(),
    /** 头像 */
    avatar: Schema.string(),
    /** 成员列表 */
    members: Schema.array(MemberMeta),
    /** 聊天室列表 */
    chatrooms: Schema.array(ChatRoomMeta).optional(),
    /** 介绍信息 */
    description: Schema.string().optional(),
    /** 创建时间 */
    createdAt: Schema.from(Date).optional()
  })
  export type Model = Schema.InferS<typeof Model>
}
