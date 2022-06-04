import { ChatRooms, Messages, Users } from '@boiling/core'
import { UsersService } from './users'
import { MessageModel } from '../dao/message'
import { ChatRoomModel } from '../dao/chatRoom'
import { Period, periodQuery } from '../utils'

export namespace ChatRoomsService {
  export const Model = ChatRoomModel
  type M = ChatRooms.Model

  /**
   * 创建聊天室
   *
   * @param members
   * @param options
   */
  export async function create(members: M['members'], options?: Partial<Pick<M, 'name' | 'avatar'>>) {
    if (members.length === 2 && await exists(members))
      throw new HttpError('CONFLICT', `members 为 [${ members.join(', ') }] 的聊天室已存在`)
    if (
      await Promise.all(members.map(id => UsersService.exists(id)))
        .then(exists => !exists.every(Boolean))
    ) throw new HttpError('NOT_FOUND', 'members 中存在不存在的用户')

    return new Model({
      members, ...options,
      createdAt: new Date()
    }).save()
  }
  /**
   * 判断聊天室是否存在
   * @param id 聊天室 id
   */
  export function exists(id: string): Promise<boolean>
  export function exists(members: number[]): Promise<boolean>
  export function exists(arg0: string | number[]): Promise<boolean>
  export function exists(arg0: string | number[]): Promise<boolean> {
    if (Array.isArray(arg0)) {
      return Model.exists({ members: arg0 })
    } else {
      return Model.exists({ _id: arg0 })
    }
  }
  /**
   * 判断聊天室是否存在且抛出异常
   * @param arg0
   */
  export function existsOrThrow(arg0: string | number[]) {
    return exists(arg0).then(exists => {
      if (!exists)
        throw new HttpError(
          'NOT_FOUND', Array.isArray(arg0)
            ? `members 为 [${ arg0.join(', ') }] 的聊天室不存在`
            : `id 为 '${ arg0 }' 的聊天室不存在`
        )
    })
  }
  type GetReturnType = ReturnType<typeof Model.findOne>
  /**
   * 获取聊天室 可通过id 或 members（仅限私聊）
   * @param id 聊天室 id
   * @param members 聊天室成员
   */
  export function get(id: string): GetReturnType
  export function get(members: number[]): GetReturnType
  export function get(arg0: string | number[]): GetReturnType
  export function get(arg0: string | number[]) {
    if (Array.isArray(arg0)) {
      return Model.findOne({ members: { $all: arg0 } })
    } else {
      return Model.findOne({ _id: arg0 })
    }
  }
  /**
   * 获取聊天室且抛出异常 可通过id 或 members（仅限私聊）
   * @param arg0
   */
  export async function getOrThrow(arg0: string | number[]) {
    await existsOrThrow(arg0)
    return get(arg0) as any as Exclude<Awaited<ReturnType<typeof get>>, null>
  }
  export function search(key: string) {
    const keywords = key.split(' ')
    const names: string[] = []
    const members: number[] = []
    keywords.forEach(keyword => {
      const [ type, content ] = keyword.split(':')
      if (!!content && type === 'members') {
        const ids = content.split(',').map(id => parseInt(id))
        members.push(...ids)
      } else {
        names.push(keyword)
      }
    })
    const filter: Parameters<typeof Model.find>[0] = {}
    if (names.length > 0) {
      filter.name = { $regex: new RegExp(names.map(n => `(.*${ n }.*)`).join('|')) }
    }
    if (members.length > 0) {
      if (members.length === 2) {
        filter.members = {
          $all: members,
          $size: 2
        }
      } else {
        filter.members = { $in: members }
      }
    }
    return Model.find(filter)
  }
  /**
   * 获取讨论组通过用户id
   * @param uid 用户id
   */
  export async function getGroups(uid: number) {
    return Model.find({
      members: { $in: [ uid ], $not: { $size: 2 } },
      channelId: { $eq: null }
    })
  }
  /**
   * 删除聊天室
   * @param id 聊天室id
   */
  export async function del(id: string) {
    await existsOrThrow(id)
    await Message.delByChatRoomId(id)
    await Model.deleteOne({ _id: id })
  }
  /**
   * 更新聊天室
   * @param id 聊天室id
   * @param options
   */
  export async function update(id: string, options: Partial<Pick<M, 'name' | 'avatar' | 'members'>>) {
    await existsOrThrow(id)
    await Model.updateOne({ _id: id }, options)
  }

  export namespace Message {
    export const Model = MessageModel
    export type M = Pick<Messages.Model, 'content'>
    /**
     * 为聊天室创建一条消息
     *
     * 如果为聊天室的第一条消息，则在用户的聊天室列表中添加该聊天室
     */
    export async function create(chatRoomId: string, senderId: number, msg: string | M) {
      await ChatRoomsService.existsOrThrow(chatRoomId)
      const sender = await UsersService.getOrThrow(senderId)
      if (typeof msg === 'string') {
        msg = { content: msg }
      }
      return new Model({
        ...msg,
        chatRoomId,
        sender: Users.BaseOut(sender),
        createdAt: new Date()
      }).save()
    }
    /**
     * 获取聊天室数据
     */
    export function get(id: string) {
      return Model.find({ id })
    }

    /**
     * 消息是否存在
     */
    export function exists(id: string) {
      return Model.exists({ _id: id })
    }
    /**
     * 删除消息
     * @param id
     */
    export async function del(id: string) {
      if (!await exists(id))
        throw new HttpError('NOT_FOUND', `id 为 '${ id }' 的消息不存在`)
      await Model.deleteOne({ _id: id })
    }
    /**
     * 通过聊天室id删除消息
     * @param chatRoomId
     */
    export async function delByChatRoomId(chatRoomId: string) {
      await getOrThrow(chatRoomId)
      await Model.deleteMany({ chatRoomId })
    }
    export interface SearchOptions {
      /**
       * 时间段
       * 0 为起始时间，1 为结束时间
       * 未填写则不做限制
       */
      period?: Period
      /** 关键词 */
      keyword?: string
      /** 发送者 id */
      senderId?: number
    }

    /**
     * 查询消息
     * @param chatRoomId
     * @param options
     */
    export function search(chatRoomId: string, options?: SearchOptions) {
      const query = <Record<string, any>>{
        ...periodQuery('createdAt', options?.period)
      }
      options?.senderId && (query['sender.id'] = options.senderId)
      return Model.find({ chatRoomId }).find(options ? query : {})
    }
  }

  export namespace User {
    /**
     * 获取聊天室的用户列表
     * @param chatRoomId
     */
    export async function get(chatRoomId: string) {
      const chatRoom = await ChatRoomsService.getOrThrow(chatRoomId)
      return Promise.all(
        (chatRoom?.members ?? []).map(id => UsersService.getOrThrow(id))
      )
    }

    /**
     * 删除聊天室成员
     * @param chatRoomId 聊天室id
     * @param uId 成员id
     */
    export async function del(chatRoomId: string, uId: number) {
      const chatRoom = await ChatRoomsService.getOrThrow(chatRoomId)
      const i = chatRoom.members.indexOf(uId)
      if (i === -1)
        throw new HttpError('NOT_FOUND', `id 为 '${ uId }' 的用户不在聊天室 '${ chatRoomId }' 中`)
      chatRoom.members.splice(i, 1)
      return chatRoom.save()
    }
  }
}
