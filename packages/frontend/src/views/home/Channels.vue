<template>
  <el-scrollbar>
    <div class="channels">
      <channel
        v-for="channel in channels"
        :key="channel.id"
        :channel="channel"
      />
    </div>
  </el-scrollbar>
</template>

<script lang="ts" setup>
import Channel from '../../components/Channel.vue'
import { nextTick, onMounted, ref } from 'vue'
import { Channels } from '@boiling/core'
import { api } from '../../api'

const channels = ref<Channels.Model[]>()

onMounted(async () => {
  await nextTick(async () => {
    channels.value = await api.user('@me').channels
  })
})
</script>

<style lang="scss" scoped>
.channels {
  padding: 20px;
}
</style>
