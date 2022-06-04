<template>
  <div class="group">
    <div
      class="avatar" :style="{
        backgroundImage: `url(${group.avatar})`
      }">
      <div
        class="avatar-shadow"
        @click="$refs.uploader.open"
      >
        更换头像
      </div>
    </div>
    <div class="info">
      {{ props.group.name }}
    </div>
    <div
      class="operates">
      <span class="material-icons"
            @click="$router.push(
              `/home/chat-rooms/${ group.id }?title=${ group.name}`
            )">
        chat_bubble_outline
      </span>
      <span class="material-icons"
            @click="$refs.configureGroup.open(props.group)">settings</span>
    </div>
    <configure-group ref="configureGroup"/>
  </div>
  <uploader-avatar
    ref="uploader"
    :avatar="group.avatar"
    @selAvatar="(selAvatar) => changeAvatar(selAvatar)"/>
</template>

<script setup lang="ts">
import { defineEmits, defineProps } from 'vue'
import { ChatRooms } from '@boiling/core'
import ConfigureGroup from './ConfigureGroup.vue'
import { ElMessageBox } from 'element-plus'
import { api } from '../api'
import UploaderAvatar from './UploaderAvatar.vue'

const
  props = defineProps({
    group: {
      type: ChatRooms.Model,
      required: true
    }
  }),
  emits = defineEmits<{
    (e: 'update'): void
  }>(),
  changeAvatar = async (avatar: string) => {
    await ElMessageBox.confirm(
      '是否确认更换头像？', '确认', {
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }
    )
    await api['chat-room'](props.group.id).upd({
      avatar
    })
    emits('update')
  }
</script>

<style scoped lang="scss">
.group {
  --bg-color: var(--color-auxi-regular);
  --size: 48px;

  display: flex;
  align-items: center;
  padding: 10px;
  margin: 10px;
  color: var(--color-text-regular);
  border-radius: 6px;
  transition: 0.3s;
  border-bottom: 1px solid var(--color-auxi-secondary);
  &:hover {
    background-color: var(--bg-color);
    opacity: 1;
  }
  > div.avatar {
    z-index: 10;
    position: relative;
    margin-right: 10px;
    width: var(--size);
    height: var(--size);
    line-height: var(--size);
    text-align: center;
    cursor: pointer;
    background-size: cover;
    border-radius: 50%;
    > div.avatar-shadow {
      position: absolute;
      width: var(--size);
      height: var(--size);
      font-size: 11px;
      background-color: #151414;
      border-radius: 50%;
      opacity: 0;
    }
    &:hover {
      > div.avatar-shadow {
        opacity: 0.8;
      }
    }
  }
  > div.info {
    flex-grow: 1;
    font-size: 16px;
    > span.id {
      color: var(--color-text-secondary);
      opacity: 0;
      transition: 0.3s;
    }
  }
  > div.operates {
    display: flex;
    align-items: center;
    > span.material-icons {
      padding: 4px;
      margin: 0 5px;
      cursor: pointer;
      border-radius: 6px;
      opacity: 0.5;
      transition: 0.3s;
      &:hover {
        opacity: 1;
      }
    }
  }
}

</style>
