<template>
  <div class="user" :class="[ type ]">
    <div class="bg"/>
    <div class="avatar" :style="{
      backgroundImage: `url(/api${info.avatar})`
    }"/>
    <div class="info">
      {{ info.remark || info.username }}<span class="id">#{{ info.id }}</span>
    </div>
    <div class="operates">
      <span v-if="isFriend"
            class="material-icons"
            @click="$router.push(`/home/chat-rooms/${ info.id }`)">chat_bubble_outline</span>
      <span class="material-icons"
            @click="$refs.configureFriend.show()">{{ isFriend ? 'settings' : 'add' }}</span>
    </div>
    <configure-friend
      ref="configureFriend"
      :is-friend="isFriend"
      :info="info"/>
  </div>
</template>

<script lang="ts" setup>
import { Users } from '@boiling/core'
import { computed } from 'vue'
import { useStore } from 'vuex'
import ConfigureFriend from './ConfigureFriend.vue'

const
  store = useStore(),
  props = withDefaults(defineProps<{
    info: Users.Out | Users.FriendOut
    type?: 'inline' | 'popup'
  }>(), {
    type: 'inline'
  }),
  isFriend = computed(() => store.state.user.friends.findIndex(
    (item: Users.Out['friends'][number]) => item.id === props.info.id
  ) !== -1)
</script>

<style lang="scss" scoped>
div.user {
  --bg-color: var(--color-auxi-regular);

  position: relative;
  display: flex;
  width: calc(100% - 20px);
  overflow: hidden;
  color: var(--color-text-regular);
  background-color: var(--bg-color);
  > div.bg {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: 60px;
    background-color: #fff;
    border-radius: 6px 6px 0 0;
  }
  > div.avatar {
    z-index: 10;
    margin-right: 10px;
    width: var(--size);
    height: var(--size);
    background-size: cover;
    border-radius: 50%;
  }
  > div.info {
    display: flex;
    align-items: center;
    font-size: 20px;
    font-weight: bold;
    > span.id {
      color: var(--color-text-secondary);
    }
  }
  > div.operates > span.material-icons {
    padding: 4px;
    margin: 0 5px;
    cursor: pointer;
    background-color: var(--bg-color);
    border-radius: 6px;
    opacity: 0.5;
    transition: 0.3s;
    &:hover {
      opacity: 1;
    }
  }
  &.inline {
    justify-content: space-between;
    padding: 10px;
    > div.bg {
      display: none;
    }
    > div.avatar {
      --size: 48px;
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
    }
    &:hover {
      > div.info > span.id {
        opacity: 1;
      }
    }
  }
  &.popup {
    flex-direction: column;
    justify-content: space-around;
    padding: 30px 10px 10px;
    height: 100px;
    border-radius: 6px;
    > div.avatar {
      --size: 64px;

      border: 6px solid var(--bg-color);
    }
    > div.operates {
      position: absolute;
      top: 10px;
      right: 10px;
    }
  }
}
</style>
