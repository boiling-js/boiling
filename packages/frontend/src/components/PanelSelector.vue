<template>
  <div class="wrapper">
    <div class="panel-selector">
      <el-tooltip placement="right" content="主页">
        <div class="select"><img width="36" src="../assets/img/favicon.svg" alt="主页"></div>
      </el-tooltip>
      <el-tooltip placement="right" content="探索">
        <div class="select"><el-icon :size="24" color="#fff"><compass/></el-icon></div>
      </el-tooltip>
      <el-tooltip placement="right" content="创建">
        <div class="select"><el-icon :size="24" color="#fff"><plus/></el-icon></div>
      </el-tooltip>
      <el-divider/>
      <div class="select"/>
      <div class="select"/>
      <div class="select"/>
      <div class="select"/>
      <div class="select"/>
      <div class="select"/>
      <div class="select"/>
      <div class="select"/>
      <div class="select"/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ElDivider, ElTooltip, ElIcon } from 'element-plus'
import { Compass, Plus } from '@element-plus/icons-vue'
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
    > div.select {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 5px;
      width: 36px;
      height: 36px;
      background-color: #36393f;
      border-radius: 4px;
      cursor: pointer;
      transition: 0.3s;
      &:hover {
        border-radius: 20px;
      }
    }
    > div.el-divider--horizontal {
      margin: 0;
      width: 60%;
      height: 2px;
      border-top: none;
      background-color: gray;
    }
  }
}
</style>
