import { Schema, model } from 'mongoose'
import { expect } from 'chai'

import usePagination from '../../src/hooks/usePagination'

const testSchema = new Schema<{ name: string, index: number }>({
  name: {
    type: String,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
})

export const TestModel = model('Test', testSchema)

namespace TestService {
  export const Model = TestModel
  export function search(key: string) {
    return Model.find({ name: new RegExp(`.*${key}.*`) })
  }
}

after(() => process.exit(0))

describe('use Pagination', () => {
  before(async () => {
    await require('../../src/dao/index.ts').default()
    for (let i = 0; i < 48; i++) {
      await TestModel.create({ name: `test${i}`, index: i })
    }
  })
  after(async () => {
    await TestModel.deleteMany({})
  })
  it('should get target test data by use pagination.', async () => {
    let p = await usePagination(TestService, {})<{ name: string }>('')
    expect(p.count).to.be.eq(48)
    expect(p.items.length).to.be.eq(10)
    expect(p.items[0].name).to.be.eq('test0')
    p = await usePagination(TestService, { page: 1 })<{ name: string }>('')
    expect(p.items.length).to.be.eq(10)
    expect(p.items[0].name).to.be.eq('test10')
    p = await usePagination(TestService, { page: 1, num: 15 })<{ name: string }>('')
    expect(p.items.length).to.be.eq(15)
    expect(p.items[0].name).to.be.eq('test15')
  })
  it('should get target test data by order.', async () => {
    let p = await usePagination(
      TestService, {}
    )<{ name: string }>('')
    expect(p.items[0].name).to.be.eq('test0')
    p = await usePagination(
      TestService, {}, [[ 'index', -1 ]]
    )<{ name: string }>('')
    expect(p.items[0].name).to.be.eq('test47')
  })
})
