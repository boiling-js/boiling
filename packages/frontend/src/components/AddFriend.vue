<template>
  <el-dialog
    v-model="dialogVisible"
    title="添加好友"
    width="60%"
    :before-close="handleClose">
    <div class="add-friend">
      <el-input
        v-model="search.key"
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
          class="user"
          :info="item"/>
      </div>
      <el-pagination
        :page-size="+search.num"
        :pager-count="+search.page"
        layout="prev, pager, next"
        :total="searchFriend.count"
        small
        @current-change="searchUser"/>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElDialog, ElInput, ElPagination } from 'element-plus'
import { Search }  from '@element-plus/icons-vue'
import User from './User.vue'
import useModelWrapper from '../hooks/useModelWrapper'
import { api } from '../api'
import { Pagination, SearchQuery, Users } from '@boiling/core'

const
  props = defineProps({
    modelValue: Boolean
  }),
  emit = defineEmits(['update:modelValue']),
  search = ref<SearchQuery>({
    page: '0',
    num: '10',
    key: ''
  })
let searchFriend = ref<Pagination<Users.Out>>({ count: 0, items: [] }),
  dialogVisible =  useModelWrapper(props, emit, 'modelValue')

function handleClose (done: () => void) {
  done()
  dialogVisible.value = false
}
async function searchUser() {
  searchFriend.value = await api.users.query({
    key: search.value.key,
    page: search.value.page,
    num: search.value.num
  })
}

</script>

<style lang="scss" scoped>
.add-friend {
  > div.search-friend {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    > .user {
      margin: 10px 0;
      width: calc(50% - 30px);
    }
  }
}
</style>
