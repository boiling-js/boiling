import { createStore } from 'vuex'

export default createStore({
  state: {
    isHiddenLeftSelector: false
  },
  mutations: {
    toggleLeftSelector(state) {
      state.isHiddenLeftSelector = !state.isHiddenLeftSelector
    }
  }
})
