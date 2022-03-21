<template>
  <div class="chat">
    <div class="top-bar">
      <span class="icon material-icons"
            @click="$router.back()">arrow_back_ios_new</span>
      <span>{{ props.id }}</span>
    </div>
    <div class="room">
      <div class="content">
        <div
          v-for="historyMessage in historyMessages"
          :key="historyMessage.chatRoomId"
          class="item">
          <img
            class="avatar"
            :src="`/api/${historyMessage.sender.avatar}`">
          <div class="message">
            <div class="time">{{ getLocalTime(historyMessage.createdAt) }}</div>
            <div class="text">{{ historyMessage.content }}</div>
          </div>
        </div>
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
import { onMounted, reactive, ref } from 'vue'
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
  },
  getLocalTime = (nS: string) => {
    return new Date(parseInt(nS)).toLocaleString().replace(/:\d{1,2}$/, ' ')
  },
  getHistoryMessages = async () => {
    // const
    //   messages = await api['chat-room'](`[${new Date().getTime()}]:${store.state.user.id}:${props.id}:`).messages.get()
    // historyMessages = messages
  }

onMounted(() => getHistoryMessages())
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
      > .item {
        display: flex;
        margin-bottom: 10px;
        > .avatar {
          margin-right: 15px;
          width: 45px;
          height: 45px;
          border-radius: 50%;
        }
        > .message {
          display: flex;
          flex-direction: column;
          justify-content: center;
          > .time {
            color: #ccc;
            font-size: 12px;
          }
          > .text {
            margin-top: 5px;
            color: #fff;
            font-size: 14px;
            word-break: break-all;
          }
        }
      }
    }
    > div.message-input {
      height: 60px;
    }
  }
}
</style>
