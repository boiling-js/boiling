<template>
  <div class="message-sender" :style="{
    'padding-top': srcList.length > 0 ? '130px' : '0',
  }">
    <el-scrollbar v-if="srcList.length > 0"
                  class="sel-images"
                  always>
      <template v-for="(url, index) in srcList" :key="url">
        <el-image
          style="width: 100px; height: 100px; min-width: 100px;"
          :src="url"
          :preview-src-list="srcList"
          :initial-index="index"
          fit="cover"
        />
      </template>
    </el-scrollbar>
    <div class="top-bar">
      <div class="options">
        <el-popover
          placement="top-start"
          :width="210"
          trigger="click">
          <emoticons @emoji-sel="(e)=> content += e"/>
          <template #reference>
            <span class="material-icons" v-text="'emoji_emotions'"/>
          </template>
        </el-popover>
        <input ref="selFile" type="file" style="display: none;">
        <span class="material-icons"
              @click="() => addFile('image')"
              v-text="'image'"/>
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
import { ElInput, ElButton, ElTooltip, ElPopover, ElImage, ElScrollbar } from 'element-plus'
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
  selFile = ref<HTMLInputElement | null>(null),
  srcList = ref<string[]>([]),
  send = async () => {
    if (content.value.trim() || srcList.value.length) {
      let mContent = content.value.trim()
      if (srcList.value.length > 0) {
        mContent += '\n' + srcList.value.map(src => `![image](${ src })`).join('\n')
      }
      const m =
        await api['chat-room'](props.chatRoomId).messages.add({ content: mContent })
      content.value = ''
      srcList.value = []
      emits('sended', m)
    }
  },
  addFile = (type: 'image' | 'image/gif' | 'unknown') => {
    if (!selFile.value)
      return
    selFile.value.accept = {
      image: 'image/png, image/jpeg',
      'image/gif': 'image/gif',
      unknown: '*/*'
    }[type]
    selFile.value.onchange = () => {
      if (!selFile.value)
        return

      const formData = new FormData()
      for (let i = 0; i < (selFile.value.files?.length ?? 0); i++) {
        const file = selFile.value.files?.[i]
        file && formData.append(`file-${ i }`, file)
      }
      fetch('/api/common/upload', { method: 'POST', body: formData })
        .then(r => r.json())
        .then((files: string[]) => {
          srcList.value.push(...files.map(f => `/api/uploads/${ f }`))
        })
    }
    selFile.value.click()
  }

watch(content, () => {
  emits('content-change')
})
</script>

<style lang="scss" scoped>
@import "../assets/scroll-bar";
div.message-sender {
  position: relative;
  > div.el-scrollbar.sel-images {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    height: 130px;
    :deep(> div.el-scrollbar__wrap > div.el-scrollbar__view) {
      display: flex;
      > div.el-image {
        padding: 10px 20px 10px 0;
        &:first-child {
          padding-left: 10px;
        }
        > img {
          border-radius: 4px;
        }
      }
    }
  }
  > div.top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0;
    > div.options {
      display: flex;
      column-gap: 0.5rem;
      /* stylelint-disable no-descending-specificity */
      > :deep(span) {
        color: #fff;
        cursor: pointer;
        transition: 0.3s;
        user-select: none;
        &:hover {
          color: var(--color-text-primary);
        }
      }
      /* stylelint-enable no-descending-specificity */
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
