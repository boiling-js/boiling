<template>
  <div class="chat">
    <div class="top-bar">
      <span class="icon material-icons"
            @click="$router.back()">arrow_back_ios_new</span>
      <span>{{ props.id }}</span>
    </div>
    <div class="room">
      <div class="content"/>
      <div class="message-input">
        <el-input v-model="editingMessage" type="textarea"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElInput } from 'element-plus'
import { ref } from 'vue'

const
  props = defineProps<{
    id: number
  }>(),
  editingMessage = ref('')
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
