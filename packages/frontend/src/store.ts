import { createStore } from 'vuex'
import { Users } from '@boiling/core'
import CreatePersistedState from 'vuex-persistedstate'

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
  plugins: [CreatePersistedState()]
})
