import { Schema, model } from 'mongoose'
import { ChatRooms } from '@boiling/core'

export const chatRoomSchema = new Schema<ChatRooms.Model>({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  members: [{
      type: [String],
      required: true
  }],
  createdAt: {
    type: String,
    required: true
  }
})

export const ChatRoomModel = model('ChatRoom', chatRoomSchema)
