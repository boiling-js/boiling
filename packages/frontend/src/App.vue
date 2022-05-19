<template>
  <title-bar/>
  <div v-if="isLoading" class="container">
    <panel-selector v-if="isHiddenLeftSelector" class="l"/>
    <router-view v-slot="{ Component }">
      <component :is="Component" class="r"/>
    </router-view>
    <!--
    <transition name="el-fade-in-linear">
      <component :is="Component" class="r"/>
    </transition>
    -->
  </div>
  <div v-else class="container loading">
    <boiling/>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import PanelSelector from './components/PanelSelector.vue'
import TitleBar from './components/TitleBar.vue'
import Boiling from './components/Boiling.vue'

const
  store = useStore(),
  isHiddenLeftSelector = computed(() => !store.state.isHiddenLeftSelector),
  isLoading = ref(false)

onMounted(() => {
  setTimeout(() => {
    isLoading.value = true
  }, process.env.NODE_ENV === 'development' ? 1000 : 4000)
})
</script>

<style lang="scss">
html, body { margin: 0; }
#app {
  /* stylelint-disable length-zero-no-unit */
  --title-bar-height: 0px;
  /* stylelint-enable length-zero-no-unit */

  display: flex;
  height: 100vh;
  overflow: hidden;
  font-family: "Avenir", "Helvetica", "Arial", sans-serif;
  -webkit-font-smoothing: antialiased;
  flex-direction: column;
  justify-content: space-between;
  div.title-bar {
    display: none;
  }
  &.is-desktop {
    --title-bar-height: 26px;

    margin: 5px;
    height: calc(100vh - 10px);
    border-radius: 6px;
    box-shadow: 0 0 5px rgb(0 0 0 / 80%);
    div.title-bar {
      display: flex;
    }
  }
}
</style>

<style lang="scss" scoped>
div.title-bar {
  min-height: var(--title-bar-height);
}
div.container {
  display: flex;
  width: 100%;
  height: calc(100% - var(--title-bar-height));
  justify-content: space-between;
  background-color: var(--color-auxi-primary);
  &.loading {
    justify-content: center;
    align-items: center;
  }
  > div.l {
    height: 100%;
    min-width: 70px;
  }
  > div.r {
    flex-grow: 1;
    height: 100%;
  }
}
</style>
