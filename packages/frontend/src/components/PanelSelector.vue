<template>
  <div class="wrapper">
    <el-scrollbar>
      <div class="panel-selector">
        <el-tooltip placement="right" content="主页">
          <div class="option" @click="$router.push('/home')">
            <img width="36" src="../assets/img/favicon.svg" alt="主页">
          </div>
        </el-tooltip>
        <el-tooltip placement="right" content="探索">
          <div class="option" @click="$router.push('/share')">
            <el-icon :size="24" color="#fff"><compass/></el-icon>
          </div>
        </el-tooltip>
        <el-tooltip placement="right" content="创建">
          <div class="option" @click="$router.push('/create-channel')">
            <el-icon :size="24" color="#fff"><plus/></el-icon>
          </div>
        </el-tooltip>
        <el-divider/>
        <el-tooltip v-for="channel in channels"
                    :key="channel.id"
                    placement="right" :content="channel.name">
          <div class="option channel"
               :class="{
                 selected: $route.name === 'channel' && $route.params.id === channel.id,
               }"
               @click="() => $router.push(`/channel/${ channel.id }`)">
            <img width="36" :src="channel.avatar" :alt="channel.id">
          </div>
        </el-tooltip>
      </div>
    </el-scrollbar>
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
import { ElDivider, ElTooltip, ElIcon, ElScrollbar } from 'element-plus'
import { Compass, Plus, ArrowRight } from '@element-plus/icons-vue'
import { Channels } from '@boiling/core'
import { api } from '../api'

const
  channels = ref<Channels.Model[]>(),
  route = useRoute(),
  store = useStore()

const initSidebarCrtlVisiable = () => {
  if (
    route.path.startsWith('/home')
    || route.path.startsWith('/channel')
  ) {
    store.commit('setSidebarCrtlVisiable', true)
  } else {
    store.commit('setSidebarCrtlVisiable', false)
  }
}

watch(() => route.path, () => {
  initSidebarCrtlVisiable()
})

onMounted(async () => {
  channels.value = await api.user('@me').channels
  initSidebarCrtlVisiable()
})
</script>

<style lang="scss" scoped>
div.wrapper {
  position: relative;
  height: 100%;
  &::-webkit-scrollbar {
    display: none;
  }
  div.panel-selector {
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
    position: absolute;
    top: calc(50% - 16px);
    left: 70px;
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
      left: calc(70px + 240px);
      > i.el-icon {
        transform: rotate(180deg);
      }
    }
  }
}
</style>
