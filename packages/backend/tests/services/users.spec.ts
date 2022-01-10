import { expect } from 'chai'

import { UsersService } from '../../src/services/users'

after(() => {
  process.exit(0)
})

describe('Users Service', function () {
  afterEach(async () => {
    await UsersService.Model.deleteMany({})
  })
  it('should add user.', async function () {
    expect(await UsersService.exist('test')).to.be.eq(false)
    const nu = await UsersService.add({ username: 'test', passwordHash: 'test', avatar: 'test' })
    expect(nu).not.to.be.undefined
    expect(nu).property('passwordHash')
      .to.be.eq('test')
    expect(await UsersService.exist('test')).to.be.eq(true)
    await UsersService.add({ username: 'test', passwordHash: 'test', avatar: 'test' })
      .catch(e => {
        if (e instanceof HttpError) {
          expect(e.msg)
            .to.be.eq('User with the name "test" already exists')
          expect(e.code)
            .to.be.eq(409)
        } else
          throw e
      })
  })
  it('should search user by username.', async function () {
    await UsersService.add({ username: 'test', passwordHash: 'test', avatar: 'test' })
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
    } = await UsersService.add({ username: 'test', passwordHash: 'test', avatar: 'test' })
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
  it('should add tags', async function () {
    const { id } = await UsersService.add({ username: 'test', passwordHash: 'test', avatar: 'test' })
    await UsersService.addTag(id, 'test')
    const user = await UsersService.get(id)
    expect(user?.tags).to.be.deep.eq(['test'])
  })
  it('should add friend', async function () {
    const [ user, friend, friend1 ] = await Promise.all([
      UsersService.add({ username: 'test', passwordHash: 'test', avatar: 'test' }),
      UsersService.add({ username: 'testFriend', passwordHash: 'testFriend', avatar: 'testFriend' }),
      UsersService.add({ username: 'testFriend1', passwordHash: 'testFriend1', avatar: 'testFriend1' })
    ])
    const id = user.id
    const fId = friend.id
    const fId1 = friend1.id
    await UsersService.Friends.add(id, fId)
    await UsersService.Friends.add(id, fId1)
    const addFriendUser = await UsersService.get(id)
    expect(addFriendUser?.friends[0].id).to.be.eq(fId)
    expect(addFriendUser?.friends[1].id).to.be.eq(fId1)
  })
  it('should get friends', async function () {
    const [ user, friend, friend1, friend2 ] = await Promise.all([
      UsersService.add({ username: 'test', passwordHash: 'test', avatar: 'test' }),
      UsersService.add({ username: 'testFriend', passwordHash: 'testFriend', avatar: 'testFriend' }),
      UsersService.add({ username: 'testFriend1', passwordHash: 'testFriend1', avatar: 'testFriend1' }),
      UsersService.add({ username: 'testFriend2', passwordHash: 'testFriend2', avatar: 'testFriend2' })
    ])
    const id = user.id
    await UsersService.Friends.add(id, friend.id, {
      tags: ['tag0'],
      remark: 'remark0'
    })
    await UsersService.Friends.add(id, friend1.id, {
      tags: ['tag1'],
      remark: 'remark1'
    })
    await UsersService.Friends.add(id, friend2.id, {
      tags: ['tag2'],
      remark: 'remark2'
    })
    const addFriend = await UsersService.Friends.get(id)
    for (let i = 0; i < addFriend.length; i++) {
      expect(addFriend[i].tags).to.be.deep.eq([`tag${i}`])
      expect(addFriend[i].remark).to.be.eq(`remark${i}`)
    }
  })
})
