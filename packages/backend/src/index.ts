import Koa from 'koa'
import websockify from 'koa-websocket'
import bodyParser from 'koa-bodyparser'
import DAOMain from './dao'

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: number
      HOST: string
    }
  }
}

const app = websockify(new Koa())

import { router as WSRouter } from './routes/ws'
import { router as UsersRouter } from './routes/users'
import { router as ChannelsRouter } from './routes/channels'
app.ws.use(WSRouter)
app
  .use(bodyParser())
  .use(UsersRouter.routes())
  .use(UsersRouter.allowedMethods())
  .use(ChannelsRouter.routes())
  .use(ChannelsRouter.allowedMethods())

app.listen(process.env.PORT, process.env.HOST, async () => {
  // connect mongodb database
  try {
    await DAOMain()
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
  console.log(`server is running on http://${ process.env.HOST }:${ process.env.PORT }`)
})
