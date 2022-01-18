import Schema from 'schemastery'
import { expect } from 'chai'
import '../src/schemastery-interface'

it('should use `optional` method.', function () {
  const O = Schema.interface({
    foo: Schema.string().optional(),
    bar: Schema.string()
  })
  O({ bar: 'bar' })
  // @ts-ignore
  expect(O.bind(null, { }))
    .to.be.throw(Error, 'bar is required but not exist')
})

it('should use schemastry interface.', () => {
  const UserOut = Schema.interface({
    name: Schema.string(),
    tags: Schema.array(Schema.string()).default([]),
    friend: Schema.interface({
      name: Schema.string()
    })
  })
  // @ts-ignore
  expect(UserOut({
    id: 1, name: 'John', tags: [],
    friend: { name: 'John' }
  })).to.be.not.have.property('id')
  // @ts-ignore
  expect(UserOut({
    id: 1, name: 'John', tags: ['John'],
    friend: { name: 'John' }
  })).property('tags').to.be.contain('John')
  // @ts-ignore
  expect(UserOut({
    id: 1, name: 'John', tags: ['John'],
    friend: {
      id: 1,
      name: 'John'
    }
  })).property('friend').to.be.not.have.property('id')
  // @ts-ignore
  expect(UserOut.bind(null, {
    id: 1, name: 'John', tags: ['John']
  })).to.be.throw('friend is required but not exist')
})
