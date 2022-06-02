import { createStore } from 'vuex'
import { Users } from '@boiling/core'
import CreatePersistedState from 'vuex-persistedstate'
import { api } from './api'
import { S_ID_KEY, S_NUM_KEY, S_TK_KEY } from './hooks/useWsClient'

export interface State {
  sidebarVisiable: boolean
  sidebarCrtlVisiable: boolean
  isHiddenLeftSelector: boolean
  user: Users.Out
}

const uDefault: State['user'] = {
  id: 0,
  username: '',
  avatar: '',
  tags: [],
  friends: [],
  status: 'online'
}

export default createStore<State>({
  state: {
    sidebarVisiable: false,
    sidebarCrtlVisiable: false,
    isHiddenLeftSelector: false,
    user: uDefault
  },
  mutations: {
    toggleSidebarVisiable(state) {
      state.sidebarVisiable = !state.sidebarVisiable
    },
    setSidebarCrtlVisiable(state, isHidden) {
      state.sidebarCrtlVisiable = isHidden
    },
    setLeftSelectorHidden(state, isHidden) {
      state.isHiddenLeftSelector = isHidden
    },
    toggleLeftSelector(state) {
      state.isHiddenLeftSelector = !state.isHiddenLeftSelector
    },
    setUser(state, user: Users.Out) {
      state.user = user
    },
    addFriend(state, friend: Users.Friend) {
      state.user.friends.push(friend)
    },
    updFriend(state, friend: Users.Friend) {
      const index = state.user.friends.findIndex(iFriend => iFriend.id === friend.id)
      state.user.friends[index] = friend
    },
    delFriend(state, id: number) {
      const index = state.user.friends.findIndex(iFriend => iFriend.id === id)
      state.user.friends.splice(index, 1)
    },
    updAvatar(state, avatar: string) {
      state.user.avatar = avatar
    },
    updStatus(state, status: Users.Status) {
      state.user.status = status
    },
    update(state, user: Users.UpdateOut) {
      state.user = { ...state.user, ...user }
    },
    clear(state) {
      state.user = uDefault
      localStorage.removeItem(S_ID_KEY)
      localStorage.removeItem(S_TK_KEY)
      localStorage.removeItem(S_NUM_KEY)
    }
  },
  actions: {
    async addFriend(context, friend: Users.Friend) {
      await api.user('@me').friends.add(friend)
      context.commit('addFriend', friend)
    },
    async delFriend(context, id: number) {
      await api.user('@me').friend(id).del()
      context.commit('delFriend', id)
    },
    async updFriend(context, friend: Users.Friend) {
      await api.user('@me').friend(friend.id).upd({
        tags: friend.tags,
        remark: friend.remark
      })
      context.commit('updFriend', friend)
    },
    async updAvatar(context, avatar: string) {
      await api.user('@me').avatar.upd({
        avatar
      })
      context.commit('updAvatar', avatar)
    },
    async updStatus(context, status: Users.Status) {
      await api.user('@me').status.upd({ status })
      context.commit('updStatus', status)
    },
    async update(context, user: Users.UpdateOut) {
      await api.user('@me').upd(user)
      context.commit('update', user)
    }
  },
  plugins: [CreatePersistedState()]
})
