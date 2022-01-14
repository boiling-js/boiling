<template>
  <div class="friends">
    <el-tabs tab-position="top" style="height: 200px;">
      <el-tab-pane label="在线">
        <user
          v-for="friend in friends" :key="friend.id"
          :info="friend"/>
      </el-tab-pane>
      <el-tab-pane label="全部">全部</el-tab-pane>
      <el-tab-pane label="离线">离线</el-tab-pane>
      <el-tab-pane label="已屏蔽">已屏蔽</el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
import { Users } from '@boiling/core'
import { onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { ElTabs, ElTabPane } from 'element-plus'
import { api } from '../../api'
import User from '../../components/User.vue'

const
  store = useStore(),
  friends = ref<Users.FriendOut[]>([]),
  refresh = async () => {
    friends.value = await api.user('@me').friends
  }

watch(() => store.state.user.friends, refresh)

onMounted(refresh)
</script>

<style scoped lang="scss">
div.friends {
  padding: 20px;
  div.el-tab-pane {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
    > div.user {
      --bg-color: var(--color-auxi-placeholder);

      cursor: pointer;
      border-bottom: 1px solid var(--color-auxi-secondary);
      transition: 0.3s;
      &:hover {
        --bg-color: var(--color-auxi-secondary);

        border-radius: 6px;
      }
    }
  }
}
</style>
