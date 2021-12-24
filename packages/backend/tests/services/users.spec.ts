import DAOMain from '../../src/dao'
import { UsersService } from '../../src/services/users'
import { expect } from 'chai'

before(async () => {
  await DAOMain()
})
after(async () => {
  await UsersService.Model.deleteMany({})
  process.exit(0)
})

describe('Users Service', function () {
  it('should test add user.', async function () {
    expect(await UsersService.exist('test')).to.be.eq(false)
    await UsersService.addUser({
      username: 'test',
      passwordHash: 'test'
    })
    expect(await UsersService.exist('test')).to.be.eq(true)
  })
})
