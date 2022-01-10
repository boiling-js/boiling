import { Session } from 'koa-session'

export default function useCurUser(session: Session | null) {
  if (session?.curUser)
    return session.curUser

  throw new HttpError('UNAUTHORIZED', '未登录')
}
