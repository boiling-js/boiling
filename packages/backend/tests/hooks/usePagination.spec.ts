import { Schema, model } from 'mongoose'
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
    return Model.find({ name: key })
  }
}

describe('use Pagination', () => {
  before(async () => {
    await require('../../src/dao/index.ts').default()
    await new TestModel({ name: 'test001' }).save()
    await new TestModel({ name: 'test002' }).save()
    await new TestModel({ name: 'test003' }).save()
    await new TestModel({ name: 'test004' }).save()
  })
  after(async () => {
    await TestModel.deleteMany({})
  })
  it('should none.', async () => {
    console.log(
      await usePagination(TestService, { key: '' })()
    )
  })
})
