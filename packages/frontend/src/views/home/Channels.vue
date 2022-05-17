<template>
  <el-scrollbar>
    <div class="channels">
      <channel
        v-for="channel in channels?.items"
        :key="channel.id"
        :channel="channel"
      />
    </div>
  </el-scrollbar>
</template>

<script lang="ts" setup>
import Channel from '../../components/Channel.vue'
import { nextTick, onMounted, ref } from 'vue'
import { Channels, Pagination } from '@boiling/core'
import { api } from '../../api'

const channels = ref<Pagination<Channels.Model>>()

onMounted(async () => {
  await nextTick(async () => {
    channels.value = await api.channels.query({ key: '' })
  })
})
</script>

<style lang="scss" scoped>
.channels {
  padding: 20px;
}
</style>
