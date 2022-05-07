<template>
  <div class="contain">
    <div v-if="showSidebar" class="sidebar">
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
            私信
            <span class="add material-icons md-light"
                  @click="$refs.searchUser.show">add</span>
          </div>
        </div>
      </div>
    </div>
    <div
      class="bar-btn"
      :style="{left: `${showSidebar ? '240px' : '0'}`}"
      @click="pullMenu"
    >
      <span class="material-icons md-light">menu</span>
    </div>
    <div class="container">
      <router-view/>
    </div>
    <search-user ref="searchUser"/>
  </div>
</template>

<script lang="ts" setup>
import {computed, ref } from 'vue'
import { useStore } from 'vuex'
import { ElTooltip, ElIcon, ElDropdown, ElDropdownMenu, ElDropdownItem, ElMessageBox } from 'element-plus'
import { Tools } from '@element-plus/icons-vue'
import SearchUser from '../../components/SearchUser.vue'
import { useRouter } from 'vue-router'

const
  store = useStore(),
  user = computed(() => store.state.user),
  status = computed(() => store.state.user.status),
  router = useRouter(),
  showSidebar = ref<Boolean>(true),
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
  },
  pullMenu = () => {
    showSidebar.value = !showSidebar.value
  }
</script>

<style lang="scss" scoped>
div.contain {
  display: flex;
  position: relative;
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
  }
  > div.bar-btn {
    position: absolute;
    left: 240px;
    top: calc(50% - 60px);
    width: 30px;
    height: 60px;
    line-height: 72px;
    text-align: center;
    border-radius: var(--border-radius);
    background-color: var(--color-auxi-regular);
    z-index: 10;
    cursor: pointer;
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
