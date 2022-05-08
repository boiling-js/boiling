<template>
  <div class="emoticons">
    <el-scrollbar class="content" height="200px" always>
      <div
        v-for="e in emoji" :key="e"
        class="emoji"
        @click="emits('emoji-sel', e)">
        {{ e }}
      </div>
    </el-scrollbar>
    <el-scrollbar class="list">
      <span class="material-icons">emoji_emotions</span>
      <div class="sel-border"/>
    </el-scrollbar>
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
  > div.el-scrollbar.content :deep(> div.el-scrollbar__wrap > div.el-scrollbar__view) {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    padding: 0 10px 0 0;
    > div.emoji {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 25px;
      height: 25px;
      cursor: pointer;
      border-radius: 4px;
      transition: 0.3s;
      &:hover {
        background: #eee;
      }
    }
  }
  > div.el-scrollbar.list :deep(> div.el-scrollbar__wrap > div.el-scrollbar__view) {
    position: relative;
    display: flex;
    justify-content: start;
    align-items: center;
    padding-top: 10px;
    padding-bottom: 5px;
    > span.material-icons {
      width: 30px;
      color: #fff;
      text-align: center;
      cursor: pointer;
      user-select: none;
    }
    > div.sel-border {
      position: absolute;
      bottom: 0;
      left: 10px;
      width: 10px;
      height: 4px;
      background-color: var(--color-primary);
      border-radius: 4px;
    }
  }
}
</style>
