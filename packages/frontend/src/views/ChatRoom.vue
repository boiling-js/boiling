<template>
  <div class="chat">
    <div class="top-bar">
      <span class="icon material-icons"
            @click="$router.back()">arrow_back_ios_new</span>
      <span class="title">{{ props.title }}</span>
    </div>
    <div class="room">
      <div ref="content" class="content">
        <template v-for="(msg, index) in messages" :key="msg.id">
          <message v-model="messages[index]"/>
        </template>
      </div>
      <message-sender v-model:chat-room-id="$props.id"
                      @content-change="keepBottom"
                      @sended="m => messages.push(m)"/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { Messages } from '@boiling/core'
import { onDispatch } from '../hooks/useWsClient'
import { api } from '../api'
import MessageSender from '../components/MessageSender.vue'
import Message from '../components/Message.vue'

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
  content = ref<HTMLDivElement | null>(null),
  messages = ref<Messages.Model[]>([]),
  getMessages = async () => {
    messages.value = messages.value || []
    const { items } =
      await api['chat-room'](props.id).messages.query({ key: '' })
    messages.value.push(...items.reverse())
  },
  keepBottom = () => {
    const element = content.value
    const isBottom = !!element && Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop) < 10
    if (element && isBottom) {
      setTimeout(() => {
        element.scrollTop = element.scrollHeight
      }, 0)
    }
  },
  init = () => {
    getMessages()

    const element = content.value
    if (element) {
      setTimeout(() => {
        element.scrollTop = element.scrollHeight
      }, 10)
    }
  }

watch(() => props.id, init)
onMounted(init)
const offDispatch = onDispatch(async m => {
  switch (m.t) {
    case 'MESSAGE':
      if (m.d.chatRoomId === props.id) {
        messages.value = messages.value || []
        messages.value.push(m.d)
      }
      break
  }
})
onUnmounted(() => {
  offDispatch()
})
</script>

<style lang="scss" scoped>
@import "../assets/scroll-bar";
div.chat {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  > div.top-bar {
    display: flex;
    align-items: center;
    padding: 0 20px;
    height: 68px;
    border-bottom: 2px solid #202225;
    > span.icon {
      margin-right: 10px;
      cursor: pointer;
      user-select: none;
      color: var(--color-text-secondary);
      transition: 0.3s;
      &:hover {
        color: var(--color-text-placeholder);
      }
    }
    > span.title {
      color: var(--color-text-placeholder);
    }
  }
  > div.room {
    display: flex;
    flex: 1 1;
    flex-direction: column;
    flex-grow: 1;
    height: calc(100% - 110px);
    > div.content {
      @include scroll-bar;

      display: flex;
      flex-grow: 1;
      flex-direction: column;
      > div.message {
        padding: 10px 10px 0;
        transition: 0.3s;
        &:hover {
          background-color: var(--color-auxi-regular);
        }
      }
    }
    > div.message-sender {
      margin: 5px 10px;
    }
  }
}
</style>
