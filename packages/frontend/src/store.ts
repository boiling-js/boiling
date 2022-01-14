import { createStore } from 'vuex'
import { Users, ChatRoom } from '@boiling/core'
import CreatePersistedState from 'vuex-persistedstate'
import { api } from './api'

export default createStore({
  state: {
    isHiddenLeftSelector: false,
    user: <Users.Out>{
      id: 0,
      username: '',
      avatar: '',
      tags: [],
      friends: []
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
    }
  },
  actions: {
    async addFriend(context, friend: Users.Friend) {
      await api.user(this.state.user.id).friend(friend.id).add({
        tags: friend.tags,
        remark: friend.remark
      })
      context.commit('addFriend', friend)
    },
    delFriend(context, id: number) {
      context.commit('delFriend', id)
    },
    async updFriend(context, friend: Users.Friend) {
      await api.user(this.state.user.id).friend(friend.id).upd({
        tags: friend.tags,
        remark: friend.remark
      })
      context.commit('updFriend', friend)
    }
  },
  plugins: [CreatePersistedState()]
})
