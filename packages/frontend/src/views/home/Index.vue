<template>
  <div class="contain">
    <div class="sidebar">
      <div class="self-bar">
        <div class="avatar">
          <el-dropdown trigger="click">
            <img width="48" :src="`/api/${ user.avatar }`" alt="">
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item><div class="circle green"/>在线</el-dropdown-item>
                <el-dropdown-item><div class="circle red"/>勿扰</el-dropdown-item>
                <el-dropdown-item><div class="circle yellow"/>隐身</el-dropdown-item>
                <el-dropdown-item><div class="circle gray"/>退出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div class="detail">
          <div class="name"> {{ user.username }} </div>
        </div>
        <el-tooltip content="用户设置">
          <el-icon @click="$router.push('/edit-personnel')" :size="24"><tools/></el-icon>
        </el-tooltip>
      </div>
      <div class="chat-bar">
        <section @click="$router.push('/home/friends')">好友</section>
        <section @click="chatType = 'channel'">频道</section>
        <section @click="chatType = 'group'">讨论组</section>
        <div class="chats">
          <div class="title">
            私信
            <span class="add material-icons md-light"
                  @click="$refs.searchUser.show">add</span>
          </div>
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
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { ElTooltip, ElIcon, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus'
import { Tools } from '@element-plus/icons-vue'
import SearchUser from '../../components/SearchUser.vue'

type ChatType = 'friend' | 'channel' | 'group'

const
  store = useStore(),
  user = computed(() => store.state.user),
  chatType = ref<ChatType>('friend')
</script>

<style lang="scss" scoped>
div.contain {
  display: flex;
  > div.sidebar {
    display: flex;
    flex-direction: column;
    width: 240px;
    background-color: var(--color-auxi-regular);
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
          > span.add { cursor: pointer; }
        }
      }
    }
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
              background-color: #fff;
              border-radius: 100%;
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
  }
  > div.container {
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
    &.red {
      background-color: #ed4245;
    }
    &.green {
      background-color: #3ba55d;
    }
    &.yellow {
      background-color: #faa81a;
    }
    &.gray {
      background-color: #747f8d;
    }
  }
}
</style>
