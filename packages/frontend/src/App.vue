<template>
  <title-bar/>
  <div class="container">
    <panel-selector v-if="isHiddenLeftSelector" class="l"/>
    <router-view v-slot="{ Component }">
      <transition name="el-fade-in-linear">
        <component :is="Component" class="r"/>
      </transition>
    </router-view>
  </div>
</template>

<script lang="ts" setup>
import PanelSelector from './components/PanelSelector.vue'
import { computed } from 'vue'
import { useStore } from 'vuex'
import TitleBar from './components/TitleBar.vue'

const
  store = useStore(),
  isHiddenLeftSelector = computed(() => !store.state.isHiddenLeftSelector)
</script>

<style lang="scss">
html { margin: 0; }
body { margin: 5px; }
#app {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: calc(100vh - 10px);
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
}
</style>

<style lang="scss" scoped>
$h: 26px;
div.title-bar {
  min-height: $h;
}
div.container {
  height: calc(100% - #{$h});
  display: flex;
  justify-content: space-between;
  > div.l {
    width: 70px;
    height: 100%;
    background-color: #202225;
  }
  > div.r {
    flex-grow: 1;
    height: 100%;
    background-color: #fff;
  }
}
</style>
