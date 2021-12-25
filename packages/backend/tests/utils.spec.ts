import { Security } from '../src/utils'

describe('Utils', function () {
  describe('Security', function () {
    it('should password is match passwordHash.', function () {
      Security.match('123', Security.encrypt('123'))
    })
  })
})
