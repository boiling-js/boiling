<template>
  <div class="channel-card">
    <el-popover
      placement="bottom-start"
      title="频道描述"
      trigger="hover"
      :content="channel.description"
    >
      <template #reference>
        <div class="avatar">
          <img :src="channel.avatar" alt="">
        </div>
      </template>
    </el-popover>
    <div class="content">
      <h3 class="title">{{ channel.name }}</h3>
      <div class="operates">
        <span
          v-if="channel.members.every(m => m.id === me)"
          class="material-icons icon"
          @click="$router.push(
            `/channel/${ channel.id }?title=${ channel.name }`
          )"
        > chat_bubble_outline </span>
        <span
          v-else
          class="material-icons icon"
          @click="addMember"> add </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ElPopover, ElMessage } from 'element-plus'
import { Channels } from '@boiling/core'
import { computed } from 'vue'
import { useStore } from 'vuex'
import { api } from '../api'

const
  props = defineProps<{
    channel: Channels.Model
  }>(),
  store = useStore(),
  me = computed(() => {  return store.state.user.id })
const
  addMember = async () => {
    await api.channel(props.channel.id).members.add({
      members: [{ id: me.value }]
    })
    ElMessage.success('添加成功！')
  }
</script>

<style lang="scss" scoped>
.channel-card {
  --w: 210px;
  --h: 320px;

  width: var(--w);
  height: var(--h);
  background-color: #fff;
  border-radius: var(--border-radius);
  > .avatar {
    width: var(--w);
    height: var(--w);
    > img {
      width: 100%;
      height: 100%;
    }
  }
  > div.content {
    padding: 5px;
    > div.operates > span.material-icons {
      float: right;
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
  }
}
</style>
