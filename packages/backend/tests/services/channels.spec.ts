import { expect, use } from 'chai'
import cap from 'chai-as-promised'
import { ChannelsService } from '../../src/services/channels'
import { Users } from '@boiling/core'
import { UsersService } from '../../src/services/users'

use(cap)

after(() => {
  process.exit(0)
})

describe('Channels Service', () => {
  let u0: Users.Base
  after(async () => {
    await UsersService.Model.deleteMany({})
  })

  before(async () => {
    u0 = await UsersService.add({ username: '001', passwordHash: '001', avatar: '001' })
  })

  afterEach(async () => {
    await ChannelsService.Model.deleteMany({})
  })
  it('should create a channel', async () => {
    const channel = await ChannelsService.create(u0.id, { name: 'test', avatar: 'test', description: 'test' })
    expect(channel.name).to.equal('test')
    expect(channel.avatar).to.equal('test')
    expect(channel.description).to.equal('test')
  })
  it('should exits channel', async () => {
    const channel = await ChannelsService.create(u0.id, { name: 'test', avatar: 'test', description: 'test' })
    expect(await ChannelsService.exists(channel.id)).to.equal(true)
    expect(await ChannelsService.exists('62820e4c8d68d496c4e8ce97')).to.equal(false)
  })
  it('should exits channel and throw error', async () => {
    expect(await ChannelsService.exists('62820e4c8d68d496c4e8ce97')).to.equal(false)
    await expect(ChannelsService.existsOrThrow('62820e4c8d68d496c4e8ce97'),
      'throw a `NOT_FOUND` error'
    ).to.be.eventually.rejectedWith('[404] id 为 \'62820e4c8d68d496c4e8ce97\' 的频道不存在')
  })
  it('should search channel', async () => {
    await Promise.all([
      ChannelsService.create(u0.id, { name: 'name', avatar: 'avatar', description: 'des' }),
      ChannelsService.create(u0.id, { name: 'name1', avatar: 'avatar1', description: 'description1' }),
      ChannelsService.create(u0.id, { name: 'name2', avatar: 'avatar2', description: 'description2' }),
      ChannelsService.create(u0.id, { name: 'nb111', avatar: 'avatar2', description: 'description2' })
    ])
    expect(await ChannelsService.search('test')).to.be.have.lengthOf(0)
    expect(await ChannelsService.search('name')).to.be.have.lengthOf(3)
    expect(await ChannelsService.search('')).to.be.have.lengthOf(4)
  })
  it('should add subChannel', async () => {
    const channel = await ChannelsService.create(u0.id, { name: 'test', avatar: 'test', description: 'test' })
    await ChannelsService.addSubChannel(channel.id, 'test subChannel')
    expect((await ChannelsService.get(channel.id))?.subChannel[0].subTitle).to.equal('test subChannel')
  })
})
