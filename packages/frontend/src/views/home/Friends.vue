<template>
  <el-tabs class="friends" tab-position="top">
    <el-tab-pane label="全部">
      <user
        v-for="friend in friends" :key="friend.id"
        :info="friend"/>
    </el-tab-pane>
    <el-tab-pane label="在线">
      <user
        v-for="friend in friends.filter(item => item.status === 'online')" :key="friend.id"
        :info="friend"/>
    </el-tab-pane>
    <el-tab-pane label="离线">
      <user
        v-for="friend in friends.filter(item => item.status === 'offline')" :key="friend.id"
        :info="friend"/>
    </el-tab-pane>
  </el-tabs>
  <div class="filters">
    <el-select v-model="selectTags"
               multiple
               placeholder="选择指定标签">
      <el-option
        v-for="item in [{ value: 0, label: '客户' }]" :key="item.value"
        :value="item.value"
        :label="item.label"
      />
    </el-select>
    <el-input
      placeholder="搜索好友"
      :prefix-icon="Search"/>
  </div>
</template>

<script lang="ts" setup>
import { Users } from '@boiling/core'
import { onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { ElTabs, ElTabPane, ElSelect, ElInput } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { api } from '../../api'
import User from '../../components/User.vue'

const
  store = useStore(),
  selectTags = ref([]),
  friends = ref<Users.FriendOut[]>([]),
  refresh = async () => {
    friends.value = await api.user('@me').friends
  }

watch(() => store.state.user.friends, refresh, { deep: true })

onMounted(refresh)
</script>

<style scoped lang="scss">
div.friends {
  padding: 30px 20px;
  :deep(div.el-tabs__active-bar) {
    border-radius: 4px;
  }
  :deep(div.el-tabs__nav-wrap)::after {
    background-color: #0000;
  }
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
div.filters {
  display: flex;
  position: absolute;
  column-gap: 10px;
  top: 30px;
  right: 20px;
  height: 40px;
  align-items: center;
}
</style>
