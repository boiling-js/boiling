process.env.NODE_ENV = 'test'

module.exports = {
  extension: [ 'ts', 'tsx' ],
  require: [
    'dotenv/config',
    'ts-node/register'
  ]
}
