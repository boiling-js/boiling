import Koa from 'koa'
import session from 'koa-session'
import websockify from 'koa-websocket'
import koaBody from 'koa-body'
import staticMiddleware from 'koa-static'
import logger from 'koa-logger'
import { resolve } from 'path'

import './global'
import { configDotenv } from '@boiling/utils'

import { router as WSRouter } from './routes/ws'
import { router as UsersRouter } from './routes/users'
import { router as ChannelsRouter } from './routes/channels'
import { router as ChatRoomsRouter } from './routes/chat-rooms'
import { router as CommonRouter } from './routes/common'
import { Middlewares } from './middlewares'
import { initApp } from './utils'

configDotenv()

const app = websockify(new Koa())
app.keys = ['hker92hjkugfkerbl.e[gewkg68']

export const staticPath = resolve(__dirname, '../static')

app.ws.use(WSRouter)
app
  .use(staticMiddleware(staticPath))
  .use(logger())
  .use(koaBody({
    multipart: true,
    formidable: {
      hashAlgorithm: 'md5'
    }
  }))
  .use(session(app))
  .use(Middlewares.handleErrors)
  .use(Middlewares.returnBody)
  .use(UsersRouter.middleware())
  .use(ChannelsRouter.middleware())
  .use(ChatRoomsRouter.middleware())
  .use(CommonRouter.middleware())

initApp(app)

export type AppContext = typeof app.context
