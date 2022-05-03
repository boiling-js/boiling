<template>
  <div class="message-sender">
    <div class="top-bar">
      <div class="options">
        <el-popover
          placement="top-start"
          :width="200"
          trigger="click">
          <emoticons/>
          <template #reference>
            <span class="material-icons" v-text="'emoji_emotions'"/>
          </template>
        </el-popover>
        <span class="material-icons" v-text="'image'"/>
        <span class="material-icons" v-text="'gif_box'"/>
        <span class="material-icons" v-text="'upload_file'"/>
        <span class="material-icons" v-text="'code'"/>
      </div>
      <el-tooltip content="CTRL + Enter" placement="top">
        <el-button class="send"
                   type="primary"
                   size="small"
                   @click="send">
          <span class="material-icons" v-text="'send'"/>
        </el-button>
      </el-tooltip>
    </div>
    <el-input v-model="content"
              type="textarea"
              placeholder="说点什么吧~"
              :autosize="{
                minRows: 1,
                maxRows: 10
              }"
              @keyup.ctrl.enter="send"/>
  </div>
</template>

<script lang="ts" setup>
import { ElInput, ElButton, ElTooltip, ElPopover } from 'element-plus'
import { ref, watch } from 'vue'
import { Messages } from '@boiling/core'

import { api } from '../api'
import Emoticons from './Emoticons.vue'

const props = defineProps<{
  chatRoomId: string
}>()
const emits = defineEmits<{
  (e: 'sended', message: Messages.Model): void
  (e: 'content-change'): void
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

watch(content, () => {
  emits('content-change')
})
</script>

<style lang="scss" scoped>
@import "../assets/scroll-bar";
div.message-sender {
  > div.top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0;
    > div.options {
      display: flex;
      column-gap: 0.5rem;
      > :deep(span) {
        cursor: pointer;
        user-select: none;
      }
    }
    > button.el-button.send :deep(span.material-icons) {
      font-size: 1rem;
    }
  }
  > :deep(div.el-textarea) textarea {
    @include scroll-bar;

    padding: 8px;
    border: none;
    resize: none;
    &::placeholder {
      color: var(--el-text-color-primary);
    }
  }
}
</style>
