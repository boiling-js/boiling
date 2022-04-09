<template>
  <div class="message">
    <img class="avatar"
         :alt="`@${modelValue.sender.name}`"
         :src="`/api/${modelValue.sender.avatar}`">
    <div class="content">
      <div class="title">
        <span class="uname">{{ modelValue.sender.username }}</span>
        <span class="ctime">{{ dayjs(modelValue.createdAt).format('YYYY-MM-DD') }}</span>
      </div>
      <p class="text">{{ modelValue.content }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs'
import { Messages } from '@boiling/core'

defineProps<{
  modelValue: Messages.Model
}>()
</script>

<style lang="scss" scoped>
div.message {
  display: flex;
  > img.avatar {
    margin-right: 15px;
    width: 45px;
    height: 45px;
    border-radius: 50%;
  }
  > div.content {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    justify-content: center;
    > div.title {
      display: flex;
      column-gap: 5px;
      align-items: end;
      color: #ccc;
      font-size: 14px;
      > span.ctime { font-size: 10px; }
    }
    > p.text {
      margin-top: 5px;
      color: #fff;
      font-size: 14px;
    }
  }
}
</style>
