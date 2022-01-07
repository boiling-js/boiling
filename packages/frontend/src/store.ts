import { createStore } from 'vuex'
import { Users } from '@boiling/core'
import CreatePersistedState from 'vuex-persistedstate'

export default createStore({
  state: {
    isHiddenLeftSelector: false,
    user: {
      id: 0,
      username: '',
      avatar: ''
    }
  },
  mutations: {
    toggleLeftSelector(state) {
      state.isHiddenLeftSelector = !state.isHiddenLeftSelector
    },
    setUser(state, user: Users.Out) {
      state.user = user
    }
  },
  plugins: [CreatePersistedState()]
})
