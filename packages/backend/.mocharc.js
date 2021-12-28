const root = require('../../.mocharc.js')

global = new Proxy(global, {
  set(target, p, value, receiver) {
    if (p === 'describe') {
      target[p] = function (...args) {
        const [title, cb] = args
        if (title.endsWith(' Service')) {
          before(async () => {
            await require('./src/dao/index.ts').default()
          })
        }
        return value(title, cb)
      }
    } else {
      target[p] = value
    }
    return true
  }
})

module.exports = Object.assign(root, {
  require: [
    ...root.require,
    './src/global/index.ts'
  ]
})
