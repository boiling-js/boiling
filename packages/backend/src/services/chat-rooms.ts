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
    members.forEach(id => UsersService.getOrThrow(id))
    return new Model({
      members, ...options,
      createdAt: new Date()
    }).save()
  }
  export function exists(id: string): Promise<boolean>
  export function exists(members: number[]): Promise<boolean>
  export function exists(arg0: string | number[]): Promise<boolean>
  export function exists(arg0: string | number[]): Promise<boolean> {
    if (Array.isArray(arg0)) {
      return Model.exists({ members: { $all: arg0 } })
    } else {
      return Model.exists({ id: arg0 })
    }
  }
  type GetReturnType = ReturnType<typeof Model.findOne>
  export function get(id: string): GetReturnType
  export function get(members: number[]): GetReturnType
  export function get(arg0: string | number[]): GetReturnType
  export function get(arg0: string | number[]) {
    if (Array.isArray(arg0)) {
      return Model.findOne({ members: { $all: arg0 } })
    } else {
      return Model.findOne({ id: arg0 })
    }
  }
  export async function getOrThrow(arg0: string | number[]) {
    if (!await exists(arg0)) {
      throw new HttpError(
        'NOT_FOUND', Array.isArray(arg0)
          ? `members 为 [${ arg0.join(', ') }] 的聊天室不存在`
          : `id 为 '${ arg0 }' 的聊天室不存在`
      )
    }
    return get(arg0)
  }
  /**
   * 获取聊天室的消息列表
   */
  export function getMessages(id: string) {
    return MessageModel.find({ chatRoomId: id })
  }
  export namespace Message {
    import BaseOut = Users.BaseOut
    export const Model = MessageModel
    export type M = Pick<Messages.Model, 'content'>
    /**
     * 为聊天室创建一条消息
     *
     * 如果为聊天室的第一条消息，则在用户的聊天室列表中添加该聊天室
     */
    export async function create(chatRoomId: string, senderId: number, msg: string | M) {
      if (!await ChatRoomsService.exists(chatRoomId))
        throw new HttpError('NOT_FOUND', `id 为 '${ chatRoomId }' 的聊天室不存在`)
      const sender = await UsersService.getOrThrow(senderId)
      if (typeof msg === 'string') {
        msg = { content: msg }
      }
      return new Model({
        ...msg,
        chatRoomId,
        sender: BaseOut(sender),
        createdAt: new Date()
      }).save()
    }
    /**
     * 获取聊天室数据
     */
    export function get(id: string) {
      return MessageModel.find({ id })
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
    export function search(chatRoomId: string, options?: SearchOptions) {
      return Model.find({ chatRoomId }).find(
        options ? {
          ...(options.senderId ? { 'sender.id': options.senderId } : {}),
          ...periodQuery('createdAt', options.period)
        } : {}
      )
    }
  }
}
