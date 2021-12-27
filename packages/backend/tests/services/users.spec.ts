import { expect } from 'chai'

import DAOMain from '../../src/dao'
import { UsersService } from '../../src/services/users'

before(async () => {
  await DAOMain()
})
after(() => {
  process.exit(0)
})

describe('Users Service', function () {
  afterEach(async () => {
    await UsersService.Model.deleteMany({})
  })
  it('should add user.', async function () {
    expect(await UsersService.exist('test')).to.be.eq(false)
    const nu = await UsersService.add({ username: 'test', passwordHash: 'test' })
    expect(nu).not.to.be.undefined
    expect(nu).property('passwordHash')
      .to.be.eq('test')
    expect(await UsersService.exist('test')).to.be.eq(true)
  })
  it('should search user by username.', async function () {
    await UsersService.add({ username: 'test', passwordHash: 'test' })
    const [ u ] = await UsersService.search('t').limit(1)
    expect(u).not.to.be.undefined
    expect(u.username).to.be.eq('test')
    expect(
      await UsersService.search('m').count()
    ).to.be.eq(0)
  })
  it('should get user by id or username.', async function () {
    const {
      id, username
    } = await UsersService.add({ username: 'test', passwordHash: 'test' })
    const [
      getByUId, getByUName, notExist
    ] = await Promise.all([
      UsersService.get(id),
      UsersService.get(username),
      UsersService.get('undefined')
    ])
    expect(getByUId?.id).to.be.eq(getByUName?.id)
    expect(notExist).to.be.eq(null)
    // @ts-ignore
    expect(UsersService.get.bind(UsersService, null))
      .to.throw('Not support type.')
  })
})
