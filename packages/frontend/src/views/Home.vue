<template>
  <div class="contain">
    <div class="sidebar">
      <div class="friend-bar">
        <div class="title">好友</div>
        <div class="current-chat-list">
          <span class="title">私信</span>
          <span
            class="add material-icons md-light"
            @click="addDialog = true"
          >add</span>
        </div>
      </div>
      <div class="self-bar">
        <div class="avatar">
          <img width="48" :src="`/api/${user.avatar}`" alt="">
        </div>
        <div class="detail">
          <div class="name"> {{ user.username }} </div>
        </div>
        <el-tooltip content="用户设置">
          <el-icon :size="24"><tools/></el-icon>
        </el-tooltip>
      </div>
    </div>
    <div class="container"/>
    <add-friend
      :model-value="addDialog"
      @update:modelValue="addDialog = $event"/>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { Users } from '@boiling/core'
import { ElTooltip, ElIcon } from 'element-plus'
import { Tools } from '@element-plus/icons-vue'
import AddFriend from '../components/AddFriend.vue'

const
  store = useStore(),
  addDialog = ref(false),
  user = computed(() => store.state.user)

onMounted(() => {
  console.log('user', user)
})
</script>

<style lang="scss" scoped>
div.contain {
  display: flex;
  > div.sidebar {
    display: flex;
    flex-direction: column;
    width: 240px;
    background-color: #21252b;
    > div.friend-bar {
      padding: 10px;
      flex-grow: 1;
      background-color: #2f3136;
      > div.title {
        padding: 10px;
        height: 20px;
        line-height: 20px;
        color: #fff;
        cursor: pointer;
        background-color: #393c43;
        border-radius: 5px;
      }
      > div.current-chat-list {
        margin: 10px 0;
        > span.title {
          line-height: 28px;
          font-size: 12px;
        }
        > span.add {
          float: right;
          line-height: 28px;
          cursor: pointer;
        }
      }
    }
    > div.self-bar {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 10px;
      background-color: #292b2f;
      border-bottom: 2px solid #202225;
      > div.avatar {
        width: 48px;
        height: 48px;
        > img {
          background-color: #fff;
          border-radius: 100%;
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
        padding: 5px;
        cursor: pointer;
        border-radius: 4px;
        transition: 0.1s;
        --color: #fff;
        &:hover {
          background-color: rgba(255, 255, 255, 0.3);
        }
      }
    }
  }
  > div.container {
    flex-grow: 1;
    background-color: #282c34;
  }
}
</style>
