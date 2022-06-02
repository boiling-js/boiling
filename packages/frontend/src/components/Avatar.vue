<template>
  <el-dialog
    v-model="showDialog"
    title="更换头像"
    width="70%">
    <el-scrollbar height="500px">
      <img
        v-for="(item, index) in avatars"
        :key="index"
        :src="`${item}`"
        @click="selAvatar(item)">
    </el-scrollbar>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElDialog, ElScrollbar } from 'element-plus'
import { api } from '../api'

const
  emits = defineEmits<{
    (e: 'selAvatar', avatar: string): void
  }>(),
  showDialog = ref<Boolean>(false),
  avatars = ref<string[]>([]),
  show = async () => {
    showDialog.value = true
    avatars.value = await api.users.avatars
  },
  selAvatar = async (avatar: string) => {
    emits('selAvatar', avatar)
    showDialog.value = false
  }

defineExpose({ show })
</script>

<style scoped lang="scss">
.el-scrollbar__view {
  display: flex;
  width: 100%;
  justify-content: start;
  flex-wrap: wrap;
  > img {
    margin: 13px;
    width: 175px;
    height: 175px;
    cursor: pointer;
    border: 4px solid var(--color-auxi-placeholder);
    border-radius: var(--border-radius);
    &:hover {
      border: 4px solid var(--color-primary);
    }
  }
}
</style>
