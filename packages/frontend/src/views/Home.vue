<template>
  <div class="contain">
    <div class="sidebar">
      <div class="self-bar">
        <div class="avatar">
          <img width="48" src="../assets/img/favicon.svg" alt="">
        </div>
        <div class="detail">
          <div class="name">YiJie</div>
        </div>
        <el-tooltip content="用户设置">
          <el-icon :size="24"><tools/></el-icon>
        </el-tooltip>
      </div>
    </div>
    <div class="container">
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ElTooltip, ElIcon } from 'element-plus'
import { Tools } from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
div.contain {
  display: flex;
  > div.sidebar {
    width: 240px;
    background-color: #21252b;
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
          font-size: 14px;
          color: #fff;
        }
      }
      > .el-icon {
        --color: #fff;
        padding: 5px;
        border-radius: 4px;
        cursor: pointer;
        transition: 0.1s;
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
