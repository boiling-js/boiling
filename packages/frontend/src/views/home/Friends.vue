<template>
  <div
    v-if="!isChatting"
    class="friends">
    <el-tabs tab-position="top" style="height: 200px;">
      <el-tab-pane label="在线">
        <user
          v-for="friend in friends"
          :key="friend.id"
          :info="friend"
          @chat="chat(friend)"
          @update="refresh"/>
      </el-tab-pane>
      <el-tab-pane label="全部">全部</el-tab-pane>
      <el-tab-pane label="离线">离线</el-tab-pane>
      <el-tab-pane label="已屏蔽">已屏蔽</el-tab-pane>
    </el-tabs>
  </div>
  <chat-room
    v-else
    :friend="chatFriend"
    @back="isChatting = false"/>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { ElTabs, ElTabPane } from 'element-plus'
import { Users } from '@boiling/core'
import { api } from '../../api'
import User from '../../components/User.vue'
import ChatRoom from '../../components/ChatRoom.vue'

const
  friends = ref<Users.FriendOut[]>([]),
  isChatting = ref<boolean>(false),
  chatFriend = ref<Users.FriendOut | null>(null),
  chat = (friend: Users.FriendOut) => {
    chatFriend.value = friend
    isChatting.value = true
  },
  refresh = async () => {
    friends.value = await api.user('@me').friends
  }

onMounted(async () => {
  await refresh()
})
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
