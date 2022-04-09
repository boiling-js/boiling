<template>
  <el-input v-model="content"
            type="textarea"
            @keyup.ctrl.enter="send"/>
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
</style>
