<template>
  <div class="chat">
    <div class="top-bar">
      <span class="icon material-icons"
            @click="$router.back()">arrow_back_ios_new</span>
      <span>{{ props.title }}</span>
    </div>
    <div class="room">
      <div class="content">
        <div
          v-for="msg in messages" :key="msg.id"
          class="item">
          <img
            class="avatar"
            :src="`/api/${msg.sender.avatar}`">
          <div class="message">
            <div>{{ msg.sender.username }}</div>
            <div class="time">{{ dayjs(msg.createdAt).format('YYYY-MM-DD') }}</div>
            <div class="text">{{ msg.content }}</div>
          </div>
        </div>
      </div>
      <div class="message-input">
        <el-input
          v-model="editingMessage"
          type="textarea"
          @keyup.ctrl.enter="sendMessage"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElInput } from 'element-plus'
import { onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import { Messages } from '@boiling/core'
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
    id: string
    title: string
  }>(),
  editingMessage = ref(''),
  messages = ref<Messages.Model[] | undefined>([]),
  getMessages = async () => {
    messages.value = messages.value || []
    const { items } =
      await api['chat-room'](props.id).messages.query({ key: '' })
    messages.value.push(...items.reverse())
  },
  sendMessage = async () => {
    if (editingMessage.value) {
      messages.value = messages.value || []
      const m =
        await api['chat-room'](props.id).message(store.state.user.id).add({
          content: editingMessage.value
        })
      messages.value.push(m)
      editingMessage.value = ''
    }
  }

/**
 * 用户打开聊天室，拉取最近的几条消息
 *   用户向上滚动的时候，拉取更多的消息，加到消息列表的最前面
 * 用户发送消息后，拿到响应数据，再将响应数据添加到消息列表中
 * 用户接收消息后，把接收到消息添加到消息列表中
 */

onMounted(() => getMessages())
onDispatch(async m => {
  switch (m.t) {
    case 'MESSAGE':
      messages.value = messages.value || []
      messages.value.push(m.d)
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
