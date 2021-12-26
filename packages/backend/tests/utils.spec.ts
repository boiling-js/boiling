import { Seq } from '../src/utils'
import DAOMain from '../src/dao'
import { expect } from 'chai'
import { SeqModel } from '../src/dao/seq'

after(() => {
  process.exit(0)
})

describe('Utils', () => {
  describe('Seq', () => {
    before(async () => {
      await DAOMain()
    })
    afterEach(async () => {
      await SeqModel.deleteMany({})
    })
    it('return value should auto increase.', async () => {
      const name = 'test'
      const v = await Seq.auto(name)
      expect(await Seq.auto(name)).to.be.eq(v + 1)
    })
    it('should auto increase on the basis of `1000`.', async () => {
      expect(await Seq.auto('test', 1000))
        .to.be.eq(1000)
    })
    it('should increase target step.', async () => {
      const name = 'test'
      const v = await Seq.auto(name)
      expect(await Seq.auto(name, 0, 2)).to.be.eq(v + 2)
    })
  })
})
