import useCurUser from './useCurUser'
import { Session } from 'koa-session'

export default function useTarget(session: Session | null, id: number | '@me') {
  return id === '@me' ? useCurUser(session).id : id
}
