<template>
  <div class="channel">
    <div
      class="avatar" :style="{
        backgroundImage: `url(${channel.avatar})`
      }"/>
    <div class="info">
      {{ props.channel.name }}
    </div>
    <div
      class="operates">
      <span class="material-icons"
            @click="$router.push(
              `/channel/${ channel.id }?title=${ channel.name }`
            )">
        chat_bubble_outline
      </span>
      <span class="material-icons"
            @click="() => $router.push({
              path: '/create-channel',
              query: {
                type: 'setting',
                info: JSON.stringify({
                  id: channel.id,
                  name: channel.name,
                  avatar: channel.avatar,
                  description: channel.description,
                })
              }
            })">settings</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Channels } from '@boiling/core'

const
  props = defineProps({
    channel: {
      type: Channels.Model,
      required: true
    }
  })
</script>

<style lang="scss" scoped>
.channel {
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
    background-size: cover;
    border-radius: 50%;
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
