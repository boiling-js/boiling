<template>
  <div class="chat">
    <div class="top-bar">
      <span
        class="icon material-icons"
        @click="$emit('back')">arrow_back_ios_new</span>
      <span>{{ props.friend.remark || props.friend.username }}</span>
    </div>
    <div class="room">

    </div>
  </div>
</template>

<script setup lang="ts">
import { Users } from '@boiling/core'

defineEmits(['back'])
const
  props = defineProps<{
    friend: Users.FriendOut
  }>()
</script>

<style scoped lang="scss">
.chat {
  width: 100%;
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
    padding: 20px;
    width: calc(100% - 40px);
  }
}
</style>
