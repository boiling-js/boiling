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
      :suffix-icon="Search"
      @keydown.enter="searchUser"/>
    <div
      class="search-friend">
      <user
        v-for="item in searchFriend.items"
        :key="item.id"
        :info="item"/>
      <el-pagination
        :page-size="10"
        :pager-count="10"
        layout="prev, pager, next"
        :total="searchFriend.count"/>
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
import { ElDialog, ElMessageBox, ElButton, ElInput, ElPagination } from 'element-plus'
import { Search }  from '@element-plus/icons-vue'
import User from './User.vue'
import useModelWrapper from '../hooks/useModelWrapper'
import { api } from '../api'
import { Pagination, Users } from '@boiling/core'

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
  let searchFriend = ref<Pagination<Users.Out>>({ count: 0, items: [] })

async function searchUser() {
  searchFriend.value = await api.users.query({
    key: searchKey.value
  })
  console.log(searchFriend)
}

</script>

<style scoped>

</style>
