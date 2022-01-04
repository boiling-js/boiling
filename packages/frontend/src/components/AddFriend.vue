<template>
  <el-dialog
    v-model="dialogVisible"
    title="添加好友"
    width="30%"
    :before-close="handleClose">
    <el-input
      v-model="searchKey"
      class="w-50 m-2"
      size="small"
      placeholder="请输入ID/用户名/关键字"
      :suffix-icon="Search"/>
    <div
      class="search-friend">
      <FriendInfoReadCard/>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogVisible = false">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElDialog, ElMessageBox, ElButton, ElInput } from 'element-plus'
import { Search }  from '@element-plus/icons-vue'
import FriendInfoReadCard from './FriendInfoReadCard.vue'
import useModelWrapper from '../hooks/useModelWrapper'
import { api } from '../api'

const
  props = defineProps({
    modelValue: Boolean
  }),
  emit = defineEmits(['update:modelValue']),
  dialogVisible =  useModelWrapper(props, emit, 'modelValue'),
  handleClose = (done: () => void) => {
    ElMessageBox.confirm('Are you sure to close this dialog?')
      .then(done)
      .catch(() => {})
  },
  // loading = ref<boolean>(false),
  searchKey = ref<string>('')
//
// async function searchUser() {
//   await api.users
// }

</script>

<style scoped>

</style>
