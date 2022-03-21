import { ChatRooms, Messages } from '@boiling/core'
import { StatusCodes } from 'http-status-codes'
import { v4 as uuid } from 'uuid'
import { UsersService } from './users'
import { MessageModel } from '../dao/message'
import { ChatRoomModel } from '../dao/chatRoom'

export namespace ChatRoomsService {
  export const Model = ChatRoomModel
  type M = Omit<ChatRooms.Model, 'id'>

  /**
   * 创建聊天室
   *
   * @param chatRoom 聊天室基本信息
   */
  export async function create(chatRoom: M) {
    return new ChatRoomModel({
      id: uuid(),
      ...chatRoom
    }).save()
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
      const user = await UsersService.getOrThrow(senderId)
      const dealIds = receiverIds.concat(senderId)
      try {
        for (let i = 0; i < dealIds.length; i++) {
          await UsersService.addChatRoom(dealIds[i], msg.chatRoomId)
        }
      } catch (e) {
        if (!(e instanceof HttpError && e.code === StatusCodes.CONFLICT)) {
          throw e
        }
      }
      return new MessageModel({
        ...msg,
        id: uuid(),
        sender: user
      }).save()
    }
    /**
     * 获取聊天室数据
     */
    export async function get(id: string) {
      return MessageModel.find({ id })
    }
  }
}
