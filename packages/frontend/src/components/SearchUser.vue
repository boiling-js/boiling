<template>
  <el-dialog
    v-model="dialogVisible"
    title="添加好友"
    width="60%"
    :before-close="handleClose">
    <div class="search-user">
      <el-input
        v-model="search.key"
        class="w-50 m-2"
        size="small"
        placeholder="请输入ID/用户名/关键字"
        :suffix-icon="Search"
        @keydown.enter="refresh"/>
      <div class="search-friend">
        <el-empty v-if="users.items.length === 0"
                  description="暂无搜索结果"/>
        <user v-for="user in users.items" :key="user.id"
              :info="user"/>
      </div>
      <el-pagination
        :page-size="search.num"
        :pager-count="search.page"
        layout="prev, pager, next"
        :total="users.count"
        small
        @current-change="refresh"/>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElEmpty, ElDialog, ElInput, ElPagination } from 'element-plus'
import { Search }  from '@element-plus/icons-vue'
import { Pagination, SearchQuery, Users } from '@boiling/core'
import User from './User.vue'
import { api } from '../api'

const
  dialogVisible = ref(false),
  search = reactive<SearchQuery>({
    page: 0,
    num: 10,
    key: ''
  }),
  users = ref<Pagination<Users.BaseOut>>({ count: 0, items: [] })

async function refresh() {
  users.value = await api.users.query(search)
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
div.search-user {
  > div.search-friend {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    > div.user {
      margin: 10px 0;
      width: calc(50% - 30px);
    }
    > div.el-empty {
      width: 100%;
    }
  }
}
</style>
