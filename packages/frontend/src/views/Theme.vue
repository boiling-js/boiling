<template>
  <div class="directory">
    <ul>
      <li>色调</li>
      <li>圆角与阴影</li>
    </ul>
  </div>
  <el-scrollbar>
    <h1>色调</h1>
    <p>Boiling 当前主题色调。</p>
    <h2>主色调</h2>
    <p>主体颜色的基准色调。</p>
    <colors-card title="Primary Color"
                 :colors="primaryColors"/>
    <colors-card style="margin-top: 10px;"
                 title="Auxiliary Color"
                 :colors="auxiliaryColors"/>
    <div class="cards" style="margin-top: 10px;">
      <colors-card title="Success Color"
                   :colors="successColors"/>
      <colors-card title="Warning Color"
                   :colors="warningColors"/>
      <colors-card title="Error Color"
                   :colors="errorColors"/>
      <colors-card title="Info Color"
                   :colors="infoColors"/>
    </div>
    <h2>文字色调</h2>
    <p>文字部分的基准色调。</p>
    <colors-card title="Text Color"
                 :colors="textColors"/>
    <h1>圆角与阴影</h1>
    <h2>圆角</h2>
    <p>项目的圆角弧度。</p>
  </el-scrollbar>
</template>

<script lang="ts" setup>
import { useStore } from 'vuex'
import { onMounted, onUnmounted } from 'vue'
import { ElScrollbar } from 'element-plus'
import ColorsCard from '../components/ColorsCard.vue'

const
  store = useStore(),
  primaryColors = [
    '#5c6bc0', '#7482d2', '#8e9ae0', '#abb4ec',
    '#c5cbf5', '#dde1fc', '#f6f7ff', '#ffffff'
  ],
  auxiliaryColors = [
    '#202225', '#282c34', '#2c313a', '#333842'
  ],
  textColors = [
    '#8f8f8f', '#bfbfbf', '#dfdfdf', '#ffffff'
  ],
  successColors = [ '#1abf73' ],
  warningColors = [ '#f5a623' ],
  errorColors = [ '#f55a4e' ],
  infoColors = [ '#8f8f8f' ]

onMounted(() => {
  store.commit('setLeftSelectorHidden', true)
})
onUnmounted(() => {
  store.commit('toggleLeftSelector')
})
</script>

<style lang="scss" scoped>
div.directory {
  padding: 10px 20px;
  width: 100px;
  color: var(--color-text-regular);
  background-color: var(--color-auxi-regular);
  > ul {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
    padding: 0;
    margin: 0;
    > li {
      display: block;
    }
  }
}
div.el-scrollbar {
  flex-grow: 1;
  padding-left: 20px;
  color: var(--color-text-secondary);
  background-color: var(--color-auxi-secondary);
  :deep(div.el-scrollbar__view) {
    padding-bottom: 20px;
  }
  &__view {
    > div.cards {
      display: flex;
      justify-content: start;
      column-gap: 10px;
    }
  }
}
</style>
