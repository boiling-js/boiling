import { Schema, model } from 'mongoose'

export interface User {
  /** 用户唯一 id */
  id: number
  /** 用户名 */
  username: string
  /** 加密的用户密码 */
  passwordHash: string
}

const userSchema = new Schema<User>({
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
