import { Schema, model } from 'mongoose'
import { Users } from '@boiling/core'

export const userSchema = new Schema<Users.Model>({
  id: {
    type: Number,
    unique: true,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    required: true
  },
  tags: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    default: 'offline'
  },
  birthday: {
    type: String
  },
  sex: {
    type: String,
    default: 'female'
  },
  desc: {
    type: String
  },
  friends: {
    type: [{
      id: Number,
      tags: [String],
      remark: String
    }],
    default: []
  }
})

export const UserModel = model('User', userSchema)
