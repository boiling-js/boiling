<template>
  <div class="chat">
    <div class="top-bar">
      <span
        class="icon material-icons"
        @click="$emit('back')">arrow_back_ios_new</span>
      <span>{{ props.friend.remark || props.friend.username }}</span>
    </div>
    <div class="room">
      <div class="content">

      </div>
      <div class="message-input">
        <el-input
          v-model="editingMessage"
          type="textarea"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Users } from '@boiling/core'
import { ElInput } from 'element-plus'
import { ref } from 'vue'

defineEmits(['back'])
const
  props = defineProps<{
    friend: Users.FriendOut
  }>(),
  editingMessage = ref<string>('')
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
