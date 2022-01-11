import useCurUser from './useCurUser'
import { Session } from 'koa-session'

export default function useTarget(params: Record<string, string>, session: Session | null, key = 'id') {
  let myId: number
  const id = params[key]
  id === '@me'
    ? (myId = useCurUser(session).id)
    : (myId = +id)
  return myId
}
