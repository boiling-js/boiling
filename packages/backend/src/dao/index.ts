import mongoose from 'mongoose'

export default async function main(reconnectTimes = 1) {
  const connectUrl = `mongodb://127.0.0.1:27017/${{
    'production': 'boiling',
    'development': 'boiling-dev',
    'test': 'boiling-test'
  }[process.env.NODE_ENV ?? 'development']}`
  for (let i = 0; i < reconnectTimes; i++) {
    console.log('connecting mongoDB server.')
    try {
      await mongoose.connect(connectUrl)
      return
    } catch (e) {
      console.warn(e)
    }
  }
  throw new Error(
    `Unable connect to mongodb server, please confirm server "${ connectUrl }" is running.`)
}
