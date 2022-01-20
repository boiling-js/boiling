<template>
  <el-dialog
    v-model="showDialog"
    title="更换头像"
    width="80%">
    <div class="avatar">
      <img
        v-for="(item, index) in avatars"
        :key="index"
        :src="`/api/${item}`"
        @click="selAvatar(item)">
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElDialog } from 'element-plus'
import { api } from '../api'

const showDialog = ref<Boolean>(false),
  avatars = ref<string[]>([]),
  show = () => {
    showDialog.value = true
  },
  selAvatar = (avatar: string) => {
    console.log(avatar)
    showDialog.value = false
  }

  onMounted(async () => {
    avatars.value = await api.users.avatars
  })
defineExpose({ show })
</script>

<style scoped lang="scss">
.avatar {
  display: flex;
  justify-content: start;
  flex-wrap: wrap;
  > img {
    margin: 10px;
    width: 160px;
    height: 160px;
    cursor: pointer;
    border: 4px solid var(--color-auxi-placeholder);
    border-radius: var(--border-radius);
    &:hover {
      border: 4px solid var(--color-primary);
    }
  }
}
</style>
