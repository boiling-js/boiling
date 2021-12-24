import { Schema, model } from 'mongoose'

export interface User {
  username: string
  /** 加密的用户密码 */
  passwordHash: string
}

const userSchema = new Schema<User>({
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
