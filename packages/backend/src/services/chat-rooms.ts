import { ChatRooms, Messages } from '@boiling/core'
import { UsersService } from './users'
import { MessageModel } from '../dao/message'
import { ChatRoomModel } from '../dao/chatRoom'

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
    members.forEach(id => UsersService.getOrThrow(id))
    return new ChatRoomModel({
      members, ...options,
      createdAt: `${new Date()}`
    }).save()
  }
  export function get(id: string) {
    return ChatRoomModel.findById(id)
  }
  /**
   * 获取聊天室的消息列表
   */
  export function getMessages(id: string) {
    return MessageModel.find({ chatRoomId: id })
  }
  export namespace Message {
    export const Model = MessageModel
    export type M = Omit<Messages.Model, 'id' | 'sender'>
    /**
     * 为聊天室创建一条消息
     *
     * 如果为聊天室的第一条消息，则在用户的聊天室列表中添加该聊天室
     */
    export async function create(
      senderId: number, msg: M, receiverIds: number[]
    ) {
    }
    /**
     * 获取聊天室数据
     */
    export async function get(id: string) {
      return MessageModel.find({ id })
    }
  }
}
