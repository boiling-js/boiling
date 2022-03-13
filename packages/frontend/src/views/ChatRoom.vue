<template>
  <div class="chat">
    <div class="top-bar">
      <span class="icon material-icons"
            @click="$router.back()">arrow_back_ios_new</span>
      <span>{{ props.id }}</span>
    </div>
    <div class="room">
      <div class="content">
        {{ historyMessages.join('\n') }}
      </div>
      <div class="message-input">
        <el-input
          v-model="editingMessage"
          type="textarea"
          @keydown.enter="sendMessage"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElInput } from 'element-plus'
import { reactive, ref } from 'vue'
import { Messages } from '@boiling/core'
import { onDispatch } from '../hooks/useWsClient'
import { api } from '../api'
import store from '../store'

const
  props = defineProps<{
    id: number
  }>(),
  editingMessage = ref(''),
  historyMessages = reactive<Messages.Model[]>([]),
  sendMessage = async () => {
    await api['chat-room'](`[${new Date().getTime()}]:${store.state.user.id}:${props.id}:`).messages.add({
      content: editingMessage.value
    })
    editingMessage.value = ''
  }

onDispatch(async m => {
  switch (m.t) {
    case 'MESSAGE':
      historyMessages.push(m.d)
      break
  }
})
</script>

<style scoped lang="scss">
.chat {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  > div.top-bar {
    display: flex;
    align-items: center;
    padding: 0 20px;
    width: calc(100% - 40px);
    height: 68px;
    border-bottom: 2px solid #202225;
    > span.icon {
      margin-right: 10px;
      cursor: pointer;
    }
  }
  > div.room {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    padding: 20px;
    width: calc(100% - 40px);
    > div.content {
      flex-grow: 1;
    }
    > div.message-input {
      height: 60px;
    }
  }
}
</style>
