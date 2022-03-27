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
import { onMounted, ref } from 'vue'
import { ChatRooms, Messages } from '@boiling/core'
import { onDispatch } from '../hooks/useWsClient'
import { api } from '../api'
import store from '../store'

/**
 * 用户加好友的时候接口中默认创建一个聊天室
 * 用户准备和好友聊天的时候
 *   先检查聊天室是否存在
 *     存在的时候，直接拿到聊天室 id
 *     不存在则创建一个新的，同时获取到 id
 *   然后通过聊天室 id 获取聊天室最近的聊天信息
 *   同时也能通过聊天室 id 发送消息
 */
const
  props = defineProps<{
    id: number
  }>(),
  editingMessage = ref(''),
  historyMessages = ref<Messages.Model[]>([]),
  chatRoom = ref<ChatRooms.Model>({
    id: '',
    name: undefined,
    avatar: undefined,
    members: [],
    createdAt: undefined
  }),
  sendMessage = async () => {
    await api['chat-room'](`${chatRoom.value.id}`).message(store.state.user.id).add({
      content: editingMessage.value
    })
    await getMessages()
    editingMessage.value = ''
  },
  getLocalTime = (nS: string) => {
    return new Date(parseInt(nS)).toLocaleString().replace(/:\d{1,2}$/, ' ')
  },
  getMessages = async () => {
    await getChatRoom()
    historyMessages.value = await api['chat-room'](chatRoom.value.id).messages
  },
  getChatRoom = async () => {
    chatRoom.value = await api['chat-rooms'].query({ key: `members:${store.state.user.id},${props.id}` })
  }

onMounted(() => getMessages())
onDispatch(async m => {
  switch (m.t) {
    case 'MESSAGE':
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
