import { Schema, model } from 'mongoose'
import { ChatRooms } from '@boiling/core'

export const chatRoomSchema = new Schema<ChatRooms.Model>({
  channelId: {
    type: String
  },
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

chatRoomSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
  }
})

export const ChatRoomModel = model('ChatRoom', chatRoomSchema)
