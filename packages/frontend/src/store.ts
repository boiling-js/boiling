import { createStore } from 'vuex'
import { Users, ChatRooms } from '@boiling/core'
import CreatePersistedState from 'vuex-persistedstate'
import { api } from './api'

export default createStore({
  state: {
    isHiddenLeftSelector: false,
    chatRoom: <ChatRooms.Base>{
    },
    user: <Users.Out>{
      id: 0,
      username: '',
      avatar: '',
      tags: [],
      friends: [],
      chatRooms: []
    }
  },
  mutations: {
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
      const index = state.user.friends.findIndex(friend => friend.id === id)
      state.user.friends = state.user.friends.splice(index - 1, 1)
    },
    updAvatar(state, avatar: string) {
      state.user.avatar = avatar
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
    }
  },
  plugins: [CreatePersistedState()]
})
