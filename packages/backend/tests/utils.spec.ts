import { expect } from 'chai'

import { Security } from '../src/utils'

describe('Utils', function () {
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
})
