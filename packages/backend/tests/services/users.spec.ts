import mockFs from 'mock-fs'
import { expect, use } from 'chai'
import cap from 'chai-as-promised'

use(cap)

import { UsersService } from '../../src/services/users'
import { ChatRoomsService } from '../../src/services/chat-rooms'
import {Security} from "../../src/utils";

after(() => {
  process.exit(0)
})

describe('Users Service', function () {
  afterEach(async () => {
    await UsersService.Model.deleteMany({})
    await ChatRoomsService.Model.deleteMany({})
    await ChatRoomsService.Message.Model.deleteMany({})
  })
  it('should add user.', async function () {
    expect(await UsersService.exists('test')).to.be.eq(false)
    const nu = await UsersService.add({ username: 'test', passwordHash: 'test', avatar: 'test' })
    expect(nu).not.to.be.undefined
    expect(nu).property('passwordHash')
      .to.be.eq('test')
    expect(await UsersService.exists('test')).to.be.eq(true)
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
  it('should get user or throw 404 error.', async function () {
    const {
      id, username
    } = await UsersService.add({ username: 'test', passwordHash: 'test', avatar: 'test' })
    await expect(UsersService.getOrThrow(id))
      .to.be.eventually.property('username').eq(username)
    await expect(UsersService.getOrThrow(id, m => m.select({ friends: 0 })))
      .to.be.eventually.property('friends').eq(undefined)
    await expect(UsersService.getOrThrow(0))
      .to.be.eventually.rejectedWith('[404] id 为 \'0\' 的用户不存在')
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
    const [ user, ...friends ] = await Promise.all([
      UsersService.add({ username: 'test', passwordHash: 'test', avatar: 'test' }),
      UsersService.add({ username: 'testFriend', passwordHash: 'testFriend', avatar: 'testFriend' }),
      UsersService.add({ username: 'testFriend1', passwordHash: 'testFriend1', avatar: 'testFriend1' }),
      UsersService.add({ username: 'testFriend2', passwordHash: 'testFriend2', avatar: 'testFriend2' })
    ])
    const id = user.id
    const opts = {
      [friends[0].id]: {},
      [friends[1].id]: {
        remark: 'remark1'
      },
      [friends[2].id]: {
        tags: ['tag2'],
        remark: 'remark2'
      }
    }
    await Promise.all(friends.map(({ id: fid }) => {
      return UsersService.Friends.add(id, fid, opts[fid])
    }))
    const newFriends = await UsersService.Friends.get(id)
    for (let i = 0; i < newFriends.length; i++) {
      const friend = newFriends[i]
      const fid = Number(friend.id)
      if (opts[fid].tags)
        expect(friend.tags)
          .to.be.include(opts[fid].tags)
      else
        expect(friend.tags)
          .to.be.empty
      expect(newFriends[i].remark)
        .to.be.eq(opts[fid].remark)
    }
  })
  it('should update friend', async function () {
    const [ user, friend ] = await Promise.all([
      UsersService.add({ username: 'test', passwordHash: 'test', avatar: 'test' }),
      UsersService.add({ username: 'testFriend', passwordHash: 'testFriend', avatar: 'testFriend' })])
    const id = user.id
    const fId = friend.id
    await UsersService.Friends.add(id, fId, {
      tags: ['tag'],
      remark: 'remark'
    })
    await UsersService.Friends.update(id, fId, {
      tags: ['tag-update'],
      remark: 'remark-update'
    })
    const addFriend = await UsersService.Friends.get(id)
    expect(addFriend[0].tags).to.be.deep.eq(['tag-update'])
    expect(addFriend[0].remark).to.be.eq('remark-update')
  })
  it('should delete friend', async function () {
    const [ user, friend, friend1 ] = await Promise.all([
      UsersService.add({ username: 'test', passwordHash: 'test', avatar: 'test' }),
      UsersService.add({ username: 'testFriend1', passwordHash: 'testFriend1', avatar: 'testFriend1' }),
      UsersService.add({ username: 'testFriend', passwordHash: 'testFriend', avatar: 'testFriend' })
    ])
    const id = user.id
    await UsersService.Friends.add(id, friend.id)
    await UsersService.Friends.add(id, friend1.id)
    await UsersService.Friends.del(id, friend.id)
    const addFriend = await UsersService.Friends.get(id)
    const chaRoom = await ChatRoomsService.get([id, friend1.id])
    for (const msg in ['hi', 'hello', 'world']) {
      await ChatRoomsService.Message.create(chaRoom!.id, friend1.id, msg)
    }
    expect(addFriend.length).to.be.eq(1)
    expect(addFriend[0].id).to.be.eq(friend1.id)
    await expect(ChatRoomsService.Message.get(chaRoom!.id)).to.be.eventually.lengthOf(3)
    await UsersService.Friends.del(id, friend1.id)
    await expect(UsersService.Friends.get(id)).to.be.eventually.lengthOf(0)
    await expect(ChatRoomsService.Message.get(chaRoom!.id)).to.be.eventually.lengthOf(0)
  })
  it('should get all avatar', async function () {
    mockFs({
      './static/img/avatar': {}
    })
    await expect(UsersService.getAvatars())
      .to.be.eventually.deep.eq([])
    const files = {
      '0.jpg': '',
      '1.jpg': ''
    }
    mockFs({
      './static/img/avatar': files
    })
    const avatars = await UsersService.getAvatars()
    expect(avatars.length).to.be.eq(2)
    Object.entries(files).forEach(([ file, _ ]) => {
      expect(avatars).to.be.include(`/img/avatar/${ file }`)
    })
  })
  it('should update user.', async function () {
    const user = await UsersService.add({ username: 'test', passwordHash: 'test', avatar: 'test' })
    await UsersService.update(user.id, { username: 'foo' })
    const newUser = await UsersService.get(user.id)
    expect(newUser?.username).to.be.eq('foo')
  })
  it('should update user when key\'s value does not exist.', async function () {
    const user = await UsersService.add({ username: 'test', passwordHash: 'test', avatar: 'test' })
    await UsersService.update(user.id, { avatar: '/img/avatar/3.jpg' })
    await UsersService.update(user.id, { status: 'offline' })
    const newUser = await UsersService.get(user.id)
    expect(newUser?.username).to.be.eq('test')
    expect(newUser?.avatar).to.be.eq('/img/avatar/3.jpg')
    expect(newUser?.status).to.be.eq('offline')
  })
  it('should update user password.', async function () {
    const user = await UsersService.add({ username: 'test', passwordHash: Security.encrypt('test'), avatar: 'test' })
    expect(Security.match('test', user!.passwordHash)).to.be.eq(true)
    await UsersService.updatePassword(user.id, 'test', 'test1')
    const newUser = await UsersService.get(user.id)
    expect(Security.match('test1', newUser!.passwordHash)).to.be.eq(true)
  })
  it('should update user password and throw error when password is not correct.', async function () {
    const user = await UsersService.add({ username: 'test', passwordHash: Security.encrypt('test'), avatar: 'test' })
    await expect(UsersService.updatePassword(user.id, 'test1', 'test1')).to.be.rejectedWith(Error)
  })
})
