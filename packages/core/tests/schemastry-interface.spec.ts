import Schema from 'schemastery'
import { expect } from 'chai'
import '../src/schemastry-interface'

it('should use schemastry interface.', () => {
  const UserOut = Schema.interface({
    name: Schema.string(),
    tags: Schema.array(Schema.string()).default([]),
    friend: Schema.interface({
      name: Schema.string()
    })
  })
  expect(UserOut({
    id: 1, name: 'John'
  })).to.not.have.property('id')
  expect(UserOut({
    id: 1, tags: ['John']
  })).property('tags').to.be.contain('John')
  expect(UserOut({
    id: 1, friend: {
      id: 1,
      name: 'John'
    }
  })).property('friend').to.not.have.property('id')
})
