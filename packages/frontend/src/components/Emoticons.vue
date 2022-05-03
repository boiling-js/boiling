<template>
  <div class="emoticons">
    <div class="content">
      <div v-for="e in emoji" :key="e" class="emoji">
        {{ e }}
      </div>
    </div>
    <div class="list">
    </div>
  </div>
</template>

<script lang="ts" setup>
import { emoji } from 'node-emoji'
</script>

<style lang="scss" scoped>
div.emoticons {
}
</style>
