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
  </div>
</template>

<script setup lang="ts">
import { Users } from '@boiling/core'

const
  props = defineProps<{
    info: Users.Out
  }>()
console.log(props.info)
</script>

<style lang="scss" scoped>
.user-info-card {
  display: flex;
  padding: 10px;
  width: 100%;
  height: 50px;
  > div.avatar {
    margin-right: 10px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    overflow: hidden;
    > img {
      width: 100%;
      height: 100%;
    }
  }
  > div.info {
    flex-grow: 1;
  }
}
</style>
