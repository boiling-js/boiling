<template>
  <div class="wrapper">
    <div class="panel-selector">
      <el-tooltip placement="bottom" content="主页">
        <div class="option" @click="$router.push('/home')">
          <img width="36" src="../assets/img/favicon.svg" alt="主页">
        </div>
      </el-tooltip>
      <el-tooltip placement="bottom" content="探索">
        <div class="option" @click="$router.push('/share')">
          <el-icon :size="24" color="#fff"><compass/></el-icon>
        </div>
      </el-tooltip>
      <el-tooltip placement="bottom" content="创建">
        <div class="option" @click="$router.push('/create-channel')">
          <el-icon :size="24" color="#fff"><plus/></el-icon>
        </div>
      </el-tooltip>
      <el-divider/>
      <div v-for="channel in channels?.items"
           :key="channel.id"
           class="option channel"
           :class="{
             selected: $route.name === 'channel' && $route.params.id === channel.id,
           }"
           @click="() => $router.push(`/channel/${ channel.id }`)">
        <img width="36" :src="channel.avatar" :alt="channel.id">
      </div>
    </div>
    <div v-show="$store.state.sidebarCrtlVisiable"
         :class="{
           'control-sidebar': true,
           'is-show': $store.state.sidebarVisiable,
         }"
         @click="() => $store.commit('toggleSidebarVisiable')">
      <el-icon color="#fff">
        <arrow-right/>
      </el-icon>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { ElDivider, ElTooltip, ElIcon } from 'element-plus'
import { Compass, Plus, ArrowRight } from '@element-plus/icons-vue'
import { Channels, Pagination } from '@boiling/core'
import { api } from '../api'

const
  channels = ref<Pagination<Channels.Model>>(),
  route = useRoute(),
  store = useStore()

watch(() => route.path, () => {
  console.log(route.path.startsWith('/home'), store.state.sidebarCrtlVisiable)
  if (route.path.startsWith('/home')) {
    store.commit('setSidebarCrtlVisiable', true)
  } else {
    store.commit('setSidebarCrtlVisiable', false)
  }
})

onMounted(async () => {
  channels.value = await api.channels.query({ key: '' })
})
</script>

<style lang="scss" scoped>
div.wrapper {
  height: 100%;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  > div.panel-selector {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: start;
    row-gap: 10px;
    padding: 10px;
    > div.option {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px;
      width: 36px;
      height: 36px;
      cursor: pointer;
      background-color: var(--color-auxi-regular);
      border-radius: 4px;
      transition: 0.3s;
      &:hover {
        border-radius: 8px;
      }
      &.channel {
        border: 1px solid var(--color-auxi-placeholder);
      }
      &.selected {
        background-color: var(--color-auxi-primary);
        border: 1px solid var(--color-primary);
      }
    }
    > div.el-divider--horizontal {
      margin: 0;
      width: 60%;
      height: 2px;
      background-color: gray;
      border-top: none;
    }
  }
  > div.control-sidebar {
    --font-size: 20px;

    z-index: 10;
    position: fixed;
    top: calc(50% - 16px);
    left: 75px;
    display: flex;
    align-items: center;
    height: 32px;
    cursor: pointer;
    background-color: #202225;
    border-radius: 0 4px 4px 0;
    > i.el-icon {
      transition: 0.3s;
      &:hover {
        color: var(--color-primary);
      }
    }
    &.is-show {
      left: calc(75px + 240px);
      > i.el-icon {
        transform: rotate(180deg);
      }
    }
  }
}
</style>
