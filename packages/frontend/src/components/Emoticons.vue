<template>
  <div class="emoticons">
    <div class="content">
      <el-scrollbar>
        <div
          v-for="e in emoji"
          :key="e"
          class="emoji"
          @click="emits('emoji-sel', e)">
          {{ e }}
        </div>
      </el-scrollbar>
    </div>
    <div class="list">
    </div>
  </div>
</template>

<script lang="ts" setup>
import { emoji } from 'node-emoji'
import { ElScrollbar } from 'element-plus'

const emits = defineEmits({
  'emoji-sel': (e: string) => e
})
</script>

<style lang="scss" scoped>
div.emoticons {
  > div.content {
    width: 200px;
    height: 200px;
    overflow-y: auto;
    div.emoji {
      display: inline-block;
      width: 1.5em;
      height: 1.5em;
      line-height: 1.5em;
      text-align: center;
      font-size: 1.5em;
      cursor: pointer;
      &:hover {
        background: #eee;
      }
    }
  }
}
</style>
