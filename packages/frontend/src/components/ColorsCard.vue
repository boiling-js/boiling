<template>
  <div class="colors-card">
    <div class="main"
         :style="{
           color: color,
           backgroundColor: colors[0]
         }">
      <span>{{ title }}</span>
      <br>
      <span>{{ colors[0] }}</span>
    </div>
    <div class="colors">
      <div v-for="c in colors" :key="c"
           class="color" :style="{
             backgroundColor: c
           }"/>
    </div>
  </div>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{
  title: string
  color?: string
  colors: string[]
}>(), {
  color: 'white'
})
</script>

<style lang="scss" scoped>
div.colors-card {
  display: flex;
  flex-direction: column;
  width: 200px;
  height: 100px;
  overflow: hidden;
  border-radius: 6px;
  > div.main {
    flex-grow: 1;
    padding: 20px;
    font-size: 14px;
    font-weight: bold;
  }
  > div.colors {
    display: flex;
    height: 20px;
    > div.color {
      flex-grow: 1;
      min-width: 20px;
    }
  }
}
</style>
