import { Schema, model } from 'mongoose'
import { expect } from 'chai'

import usePagination from '../../src/hooks/usePagination'

const testSchema = new Schema<{ name: string }>({
  name: {
    type: String,
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
      await TestModel.create({ name: `test${i}` })
    }
  })
  after(async () => {
    await TestModel.deleteMany({})
  })
  it('should get target test data by use pagination.', async () => {
    const p = await usePagination(TestService, { key: '' })<{ name: string }>()
    expect(p.count).to.be.eq(48)
    expect(p.items.length).to.be.eq(10)
  })
})
