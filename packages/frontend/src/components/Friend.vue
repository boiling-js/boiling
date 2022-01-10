<template>
  <div class="friend">
    <el-tabs tab-position="top" style="height: 200px;">
      <el-tab-pane label="在线">
        <user
          v-for="item in friends"
          :key="item.id"
          :info="item"/>
      </el-tab-pane>
      <el-tab-pane label="全部">全部</el-tab-pane>
      <el-tab-pane label="离线">离线</el-tab-pane>
      <el-tab-pane label="已屏蔽">已屏蔽</el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElTabs, ElTabPane } from 'element-plus'
import { Users } from '@boiling/core'
import { api } from '../api'
import User from './User.vue'

const friends = ref<Users.FriendOut[]>([])
onMounted(async () => {
  friends.value = await api.user('@me').friends
})

</script>

<style scoped lang="scss">
div.friend {
  padding: 20px;
  div.el-tab-pane {
    > div.user-info-card {
      margin: 10px 0;
    }
  }
}
</style>
