import { Schema, model } from 'mongoose'
import { Users } from '@boiling/core'

const userSchema = new Schema<Users.Model>({
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
  }
})

export const UserModel = model('User', userSchema)
