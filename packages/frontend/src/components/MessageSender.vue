<template>
  <div class="message-sender">
    <div class="top-bar">
      <div class="options">
        <span class="material-icons" v-text="'image'"/>
        <span class="material-icons" v-text="'upload_file'"/>
      </div>
    </div>
    <el-input v-model="content"
              type="textarea"
              :autosize="{
                minRows: 1,
                maxRows: 10
              }"
              @keyup.ctrl.enter="send"/>
  </div>
</template>

<script lang="ts" setup>
import { ElInput } from 'element-plus'
import { ref } from 'vue'
import { Messages } from '@boiling/core'

import { api } from '../api'

const props = defineProps<{
  chatRoomId: string
}>()
const emits = defineEmits<{
  (e: 'sended', message: Messages.Model): void
}>()
const
  content = ref(''),
  send = async () => {
    if (content.value.trim()) {
      const m =
        await api['chat-room'](props.chatRoomId).messages.add({ content: content.value })
      content.value = ''
      emits('sended', m)
    }
  }
</script>

<style lang="scss" scoped>
@import "../assets/scroll-bar";
div.message-sender {
  > div.top-bar {
    display: flex;
    align-items: center;
    padding: 0.5rem 0;
    > div.options {
      display: flex;
      column-gap: 0.5rem;
      > span {
        cursor: pointer;
        user-select: none;
      }
    }
  }
  > :deep(div.el-textarea) textarea {
    @include scroll-bar;

    padding: 8px;
    border: none;
    resize: none;
  }
}
</style>
