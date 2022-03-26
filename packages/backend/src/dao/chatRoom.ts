import { Schema, model } from 'mongoose'
import { ChatRooms } from '@boiling/core'

export const chatRoomSchema = new Schema<ChatRooms.Model>({
  name: {
    type: String
  },
  avatar: {
    type: String
  },
  members: [{
    type: [Number],
    required: true
  }],
  createdAt: {
    type: Date,
    required: true
  }
})

export const ChatRoomModel = model('ChatRoom', chatRoomSchema)
