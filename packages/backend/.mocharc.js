const root = require('../../.mocharc.js')

module.exports = Object.assign(root, {
  require: [
    ...root.require,
    './src/global/index.ts'
  ]
})
