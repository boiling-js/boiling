import Koa from 'koa'
import session from 'koa-session'
import websockify from 'koa-websocket'
import bodyParser from 'koa-bodyparser'
import staticMiddleware from 'koa-static'
import logger from 'koa-logger'
import { resolve } from 'path'

import './global'
import DAOMain from './dao'

const app = websockify(new Koa())
app.keys = ['hker92hjkugfkerbl.e[gewkg68']

import { router as WSRouter } from './routes/ws'
import { router as UsersRouter } from './routes/users'
import { router as ChannelsRouter } from './routes/channels'
import { Middlewares } from './middlewares'

app.ws.use(WSRouter)
app
  .use(staticMiddleware(resolve(__dirname, '../static')))
  .use(logger())
  .use(bodyParser())
  .use(session(app))
  .use(Middlewares.handleErrors)
  .use(Middlewares.returnBody)
  .use(UsersRouter.routes())
  .use(UsersRouter.allowedMethods())
  .use(ChannelsRouter.routes())
  .use(ChannelsRouter.allowedMethods())

const {
  PORT = '8080',
  HOST = 'localhost'
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
