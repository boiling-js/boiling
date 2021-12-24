import { UserModel, User } from '../dao/user'
import { Seq } from '../utils'

export namespace UsersService {
  export const Model = UserModel
  export type U = Omit<User, 'id'>
  export function search(key: string) {
    return Model.find({ username: new RegExp(`${key}.*`) })
  }
  export async function add(u: U) {
    if(await exist(u.username))
      throw new Error('the user has existed')
    return new UserModel(Object.assign({
      id: await Seq.auto('users')
    }, u)).save()
  }
  export async function del(id: number) {
    Model.findOneAndDelete({ id })
  }
  export async function exist(uname: string) {
    return await UserModel.findOne({ username: uname }) !== null
  }
}
