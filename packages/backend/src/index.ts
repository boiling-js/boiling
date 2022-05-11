import Koa from 'koa'
import session from 'koa-session'
import websockify from 'koa-websocket'
import koaBody from 'koa-body'
import staticMiddleware from 'koa-static'
import logger from 'koa-logger'
import { resolve } from 'path'

import './global'
import DAOMain from './dao'
import { configDotenv } from '@boiling/utils'

import { router as WSRouter } from './routes/ws'
import { router as UsersRouter } from './routes/users'
import { router as ChannelsRouter } from './routes/channels'
import { router as ChatRoomsRouter } from './routes/chat-rooms'
import { router as CommonRouter } from './routes/common'
import { Middlewares } from './middlewares'

configDotenv()

const app = websockify(new Koa())
app.keys = ['hker92hjkugfkerbl.e[gewkg68']

export const staticPath = resolve(__dirname, '../static')

app.ws.use(WSRouter)
app
  .use(staticMiddleware(staticPath))
  .use(logger())
  .use(koaBody({
    multipart: true
  }))
  .use(session(app))
  .use(Middlewares.handleErrors)
  .use(Middlewares.returnBody)
  .use(UsersRouter.middleware())
  .use(ChannelsRouter.middleware())
  .use(ChatRoomsRouter.middleware())
  .use(CommonRouter.middleware())

const {
  BACKEND_PORT: PORT = '8080',
  BACKEND_HOST: HOST = 'localhost'
} = process.env
app.listen(+PORT, HOST, async () => {
  // connect mongodb database
  try {
    await DAOMain()
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
  console.log(`server is running on http://${ HOST }:${ PORT }`)
})

export type AppContext = typeof app.context
