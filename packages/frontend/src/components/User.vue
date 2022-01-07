<template>
  <div class="user-info-card">
    <div class="avatar">
      <img :src="`/api/${info.avatar}`" alt="">
    </div>
    <div class="info">
      ID：{{ info.id }}
      <br>
      昵称：{{ info.username }}
    </div>
    <div class="operate">
      <span
        class="add material-icons"
        @click="add">add</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Users } from '@boiling/core'
import { ElMessage, ElMessageBox } from 'element-plus'

const
  props = defineProps<{
    info: Users.Out
  }>(),
  add = () => {
    ElMessageBox.confirm(
      `是否确认添加${ props.info.username }为好友？`,
      '确认',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }
    ).then(() => {
        ElMessage({
          type: 'success',
          message: '已发送好友请求'
        })
    }).catch()
  }
console.log(props.info)
</script>

<style lang="scss" scoped>
.user-info-card {
  display: flex;
  padding: 10px;
  width: calc(100% - 20px);
  height: 50px;
  background-color: #dad5d5;
  border-radius: 6px;
  > div.avatar {
    margin-right: 10px;
    width: 50px;
    height: 50px;
    overflow: hidden;
    border-radius: 50%;
    > img {
      width: 100%;
      height: 100%;
    }
  }
  > div.info {
    flex-grow: 1;
  }
  > div.operate {
    > span {
      cursor: pointer;
    }
  }
}
</style>
