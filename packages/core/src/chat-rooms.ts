import Schema from 'schemastery'

export namespace ChatRooms {
  /**
   * 聊天室
   */
  export const Model = Schema.interface({
    /**
     * id
     */
    id: Schema.string(),
    /**
     * 名称
     *
     * 当聊天室为私聊时，名称为空
     */
    name: Schema.string().optional(),
    /**
     * 头像
     *
     * 当聊天室为私聊时，头像为空
     * 当聊天室讨论组时，该结构 avatar 为成员头像组合
     * 当聊天室为 channel 时，该结构 avatar 为 guild 头像
     */
    avatar: Schema.string().optional(),
    /** 成员列表 */
    members: Schema.array(Number),
    /** 创建时间 */
    createdAt: Schema.from(Date).optional()
  })
  export type Model = Schema.InferS<typeof Model>
}
