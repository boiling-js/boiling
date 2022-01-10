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
        <user v-for="item in users.items" :key="item.id"
              class="user"
              :info="item"/>
      </div>
      <el-pagination
        :page-size="+search.num"
        :pager-count="+search.page"
        layout="prev, pager, next"
        :total="users.count"
        small
        @current-change="searchUser"/>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElDialog, ElInput, ElPagination } from 'element-plus'
import { Search }  from '@element-plus/icons-vue'
import { Pagination, SearchQuery, Users } from '@boiling/core'
import User from './User.vue'
import { api } from '../api'

const
  dialogVisible = ref(false),
  search = ref<SearchQuery>({
    page: '0',
    num: '10',
    key: ''
  }),
  users = ref<Pagination<Users.Out>>({ count: 0, items: [] })

async function searchUser() {
  users.value = await api.users.query({
    key: search.value.key,
    page: search.value.page,
    num: search.value.num
  })
}
function handleClose(done: () => void) {
  done()
  dialogVisible.value = false
}
function show() {
  dialogVisible.value = true
}

defineExpose({ show })
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
