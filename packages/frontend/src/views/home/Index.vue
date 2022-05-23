<template>
  <div class="contain">
    <div v-show="$store.state.sidebarVisiable" class="sidebar">
      <div class="self-bar">
        <div class="avatar">
          <el-dropdown trigger="click">
            <img width="48" :src="`/api/${ user.avatar }`" alt="">
            <div :class="`dot ${status}`"/>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="updateStatus('online')"><div class="circle online"/>在线</el-dropdown-item>
                <el-dropdown-item @click="updateStatus('noDisturb')"><div class="circle noDisturb"/>勿扰</el-dropdown-item>
                <el-dropdown-item @click="updateStatus('leave')"><div class="circle leave"/>隐身</el-dropdown-item>
                <el-dropdown-item @click="updateStatus('offline')"><div class="circle offline"/>退出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div class="detail">
          <div class="name"> {{ user.username }} </div>
        </div>
        <el-tooltip content="用户设置">
          <el-icon :size="24" @click="$router.push('/edit-personnel')"><tools/></el-icon>
        </el-tooltip>
      </div>
      <div class="chat-bar">
        <section @click="$router.push('/home/friends')">好友</section>
        <section @click="$router.push('/home/channels')">频道</section>
        <section @click="$router.push('/home/groups')">讨论组</section>
        <div class="chats">
          <div class="title">
            最近聊天室
            <span class="add material-icons md-light"
                  @click="$refs.searchUser.show">add</span>
          </div>
          <template v-for="chatRoom in chatRooms" :key="chatRoom.id">
            <div class="chat-room" @click="$router.push(`/home/chat-rooms/${ chatRoom.id }?title=${ chatRoom.name }`)">
              <img class="avatar" :src="`/api/${chatRoom.avatar}`" :alt="chatRoom.id">
              {{ chatRoom.name }}
            </div>
          </template>
        </div>
      </div>
    </div>
    <div class="container">
      <router-view/>
    </div>
    <search-user ref="searchUser"/>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElTooltip, ElIcon, ElDropdown, ElDropdownMenu, ElDropdownItem, ElMessage, ElMessageBox } from 'element-plus'
import { Tools } from '@element-plus/icons-vue'
import { ChatRooms, Users } from '@boiling/core'
import SearchUser from '../../components/SearchUser.vue'
import { api } from '../../api'

const
  store = useStore(),
  router = useRouter(),
  user = computed(() => store.state.user),
  status = computed(() => store.state.user.status),
  chatRooms = ref<ChatRooms.Model[]>([]),
  updateStatus = async (status: string) => {
    if (status === 'offline') {
      await ElMessageBox.confirm(
        '是否确认退出登录?',
        '退出登录',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        router.push('/login')
      }).catch()
    }
    await store.dispatch('updStatus', status)
  }

onMounted(async () => {
  const tempList = await api.user('@me')['chat-rooms']
  for (const chatRoom of tempList) {
    const { members } = chatRoom
    const fId = members.find(member => member !== user.value.id)
    if (!fId) {
      ElMessage.error('聊天室数据异常')
      continue
    }
    const f: Users.Friend = store.state.user.friends.find((friend: Users.Friend) => friend.id === fId)
    const u = await api.user(fId)
    chatRoom.name = f.remark || u.username
    chatRoom.avatar = u.avatar
  }
  chatRooms.value = tempList
})
</script>

<style lang="scss" scoped>
div.contain {
  position: relative;
  display: flex;
  > div.sidebar {
    display: flex;
    flex-direction: column;
    max-width: 240px;
    min-width: 240px;
    background-color: var(--color-auxi-regular);
    > div.self-bar {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 10px;
      border-bottom: 2px solid #202225;
      > div.avatar {
        width: 48px;
        height: 48px;
        .el-dropdown {
          > div {
            > img {
              cursor: pointer;
              background-color: #fff;
              border-radius: 100%;
            }
            > .dot {
              position: absolute;
              right: 5px;
              bottom: 3px;
              width: 10px;
              height: 10px;
              border: 3px solid var(--color-auxi-regular);
              border-radius: 50%;
            }
          }
        }
      }
      > div.detail {
        flex-grow: 1;
        padding: 5px;
        > div.name {
          color: #fff;
          font-size: 14px;
        }
      }
      > .el-icon {
        --color: #fff;

        padding: 5px;
        cursor: pointer;
        border-radius: 4px;
        transition: 0.1s;
        &:hover {
          background-color: rgb(255 255 255 / 30%);
        }
      }
    }
    > div.chat-bar {
      display: flex;
      flex-direction: column;
      padding: 10px;
      flex-grow: 1;
      > section {
        padding: 10px;
        height: 20px;
        line-height: 20px;
        color: var(--color-text-regular);
        cursor: pointer;
        border-radius: 5px;
        transition: 0.5s;
        user-select: none;
        &:hover, &.active {
          background-color: var(--color-auxi-secondary);
        }
      }
      > div.chats {
        margin-top: 10px;
        > div.title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: var(--color-text-primary);
          font-size: 12px;
          user-select: none;
          > span.add {
            cursor: pointer;
          }
        }
        > div.chat-room {
          display: flex;
          align-items: center;
          column-gap: 5px;
          padding: 5px;
          font-size: 12px;
          cursor: pointer;
          border-radius: 4px;
          transition: 0.3s;
          &:hover {
            background-color: var(--color-auxi-secondary);
          }
          > img.avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
          }
        }
      }
    }
  }
  > div.container {
    position: relative;
    flex-grow: 1;
    background-color: var(--color-auxi-placeholder);
  }
}
.el-dropdown-menu__item {
  > .circle {
    margin-right: 5px;
    width: 10px;
    height: 10px;
    border-radius: 100%;
  }
}
</style>
