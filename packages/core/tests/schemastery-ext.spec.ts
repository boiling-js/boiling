import Schema from 'schemastery'
import { expect } from 'chai'
import '../src/schemastery-ext'

describe('Schemastery ext', function () {
  const User = Schema.interface({
    id: Schema.number(),
    username: Schema.string(),
    password: Schema.string()
  })
  it('should use `and` method.', function () {
    const U = User.and(Schema.interface({
      avatar: Schema.string()
    }))
    expect(U({
      id: 1,
      username: 'foo',
      password: 'bar',
      avatar: 'http://example.com/foo.png'
    })).to.be.deep.equal({
      id: 1,
      username: 'foo',
      password: 'bar',
      avatar: 'http://example.com/foo.png'
    })
    // @ts-ignore
    expect(U.bind(null, {
      id: 1,
      username: 'foo',
      password: 'bar'
    })).to.be.throw('avatar is required but not exist')
  })
  it('should use `or` method.', function () {
    const U = User.or(Schema.interface({
      avatar: Schema.string()
    }))
    expect(U({
      id: 1,
      username: 'foo',
      password: 'bar'
    })).to.be.deep.equal({
      id: 1,
      username: 'foo',
      password: 'bar'
    })
    expect(U({
      id: 1,
      username: 'foo',
      password: 'bar',
      avatar: 'http://example.com/foo.png'
    })).to.be.not.have.property('avatar')
    expect(U({
      avatar: 'http://example.com/foo.png'
    })).to.be.not.have.property('id')
  })
  it('should use pick target keys.', function () {
    const UserOut = Schema.Pick(User, ['id', 'username'])
    // @ts-ignore
    expect(UserOut({
      id: 1,
      username: 'test',
      password: 'test'
    })).to.be.not.have.property('password')
  })
  it('should use omit target keys.', function () {
    const UserOut = Schema.Omit(User, ['password'])
    // @ts-ignore
    expect(UserOut({
      id: 1,
      username: 'test',
      password: 'test'
    })).to.be.not.have.property('password')
  })
})
