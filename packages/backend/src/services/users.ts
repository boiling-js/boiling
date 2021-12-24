import { UserModel, User } from '../dao/user'

export namespace UsersService {
  export const Model = UserModel
  export async function addUser(u: User) {
    if(await exist(u.username)) {
      throw new Error('the user has existed')
    }
    const newU = new UserModel(u)
    await newU.save()
  }
  export async function exist(uname: string) {
    return await UserModel.findOne({ username: uname }) !== null
  }
}
