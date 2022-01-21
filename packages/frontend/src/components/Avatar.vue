<template>
  <el-dialog
    v-model="showDialog"
    title="更换头像"
    width="920px">
    <el-scrollbar height="500px">
      <img
        v-for="(item, index) in avatars"
        :key="index"
        :src="`/api/${item}`"
        @click="selAvatar(item)">
    </el-scrollbar>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElDialog, ElMessageBox, ElScrollbar } from 'element-plus'
import { api } from '../api'
import store from '../store'

computed(() => store.state.user.avatar)
const showDialog = ref<Boolean>(false),
  avatars = ref<string[]>([]),
  show = () => {
    showDialog.value = true
  },
  selAvatar = async (avatar: string) => {
    await ElMessageBox.confirm(
      '是否确认更换头像？', '确认', {
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }
    )
    await store.dispatch('updAvatar', avatar)
    showDialog.value = false
  }

  onMounted(async () => {
    avatars.value = await api.users.avatars
  })
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
