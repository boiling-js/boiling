import Koa from 'koa'
import session from 'koa-session'
import websockify from 'koa-websocket'
import bodyParser from 'koa-bodyparser'
import './global'
import DAOMain from './dao'

const app = websockify(new Koa())
app.keys = ['hker92hjkugfkerbl.e[gewkg68']

import { router as WSRouter } from './routes/ws'
import { router as UsersRouter } from './routes/users'
import { router as ChannelsRouter } from './routes/channels'
import { HttpError } from './global/HttpError'

app.ws.use(WSRouter)
app
  .use(bodyParser())
  .use(session(app))
  .use(async (ctx, next) => {
    try {
      return await next()
    } catch (e) {
      if (e instanceof HttpError) {
        ctx.body = e.msg
        ctx.status = e.code
        return
      }
      throw e
    }
  })
  .use(UsersRouter.routes())
  .use(UsersRouter.allowedMethods())
  .use(ChannelsRouter.routes())
  .use(ChannelsRouter.allowedMethods())
  .use(ctx => {
    // ignore favicon
    // if (ctx.path === '/favicon.ico') return
    //
    // let n = ctx.session?.views || 0
    // ctx.session.views = ++n
    // ctx.body = n + ' views'
  })

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
