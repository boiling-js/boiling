import { Seq, Security } from '../src/utils'
import DAOMain from '../src/dao'
import { expect } from 'chai'
import { SeqModel } from '../src/dao/seq'

after(() => {
  process.exit(0)
})

describe('Utils', () => {
  describe('Security', function () {
    it('should password is match passwordHash.', function () {
      expect(
        Security.match('123', Security.encrypt('123'))
      ).to.be.eq(true)
      expect(
        Security.match('456', Security.encrypt('123'))
      ).to.be.eq(false)
    })
  })
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
        .to.be.eq(1001)
    })
    it('should increase target step.', async () => {
      const name = 'test'
      const v = await Seq.auto(name)
      expect(await Seq.auto(name, 0, 2)).to.be.eq(v + 2)
    })
  })
})
