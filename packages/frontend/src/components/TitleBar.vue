<template>
  <div class="title-bar">
    <div class="name"><img width="16" src="../assets/img/favicon.svg" alt="主页">Boiling</div>
    <div class="opts">
      <div class="circle-btn min" @click="min"/>
      <div class="circle-btn max" @click="max"/>
      <div class="circle-btn cls" @click="cls"/>
    </div>
  </div>
</template>

<script lang="ts" setup>
const min = () => {
  desktop?.min?.()
}, max = () => {
  desktop?.max?.()
}, cls = () => {
  window.close()
}
</script>

<style lang="scss" scoped>
div.title-bar {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  color: #afafaf;
  font-size: 14px;
  font-weight: bold;
  background-color: #202225;
  > div.name {
    flex-grow: 1;
    column-gap: 5px;
    display: flex;
    align-items: center;
    -webkit-app-region: drag;
  }
  > div.opts {
    display: flex;
    align-items: center;
    justify-content: space-between;
    column-gap: 6px;
    > div.circle-btn {
      display: flex;
      padding: 2px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      cursor: pointer;
      transition: 0.3s;
      &.min {
        background-color: #43cb44;
        &:hover {
          background-color: #2f9f2f;
        }
      }
      &.max {
        background-color: #f8bc3a;
        &:hover {
          background-color: #e69d2a;
        }
      }
      &.cls {
        background-color: #f35b5a;
        &:hover {
          background-color: #e03c3c;
        }
      }
    }
  }
}
</style>
