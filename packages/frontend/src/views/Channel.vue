<template>
  <div class="channel">
    <div class="classify">
      <div class="title">{{ props.title }}</div>
      <img class="avatar" :src="channel?.avatar" alt="">
      <el-tree :data="data" :props="defaultProps" @node-click="handleNodeClick" />
    </div>
    <div class="content">

    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, ref } from 'vue'
import { ElTree } from 'element-plus'
import { Channels } from '@boiling/core'
import { api } from '../api'

const
  props = defineProps<{
    id: string
    title: string
  }>(),
  channel = ref<Channels.Model>()

onMounted(() => {
  nextTick(async () => {
    channel.value = await api.channel(props.id)
  })
})

interface Tree {
  label: string
  children?: Tree[]
}

const handleNodeClick = (data: Tree) => {
  console.log(data)
}

const data: Tree[] = [
  {
    label: 'Level one 1',
    children: [
      {
        label: 'Level two 1-1',
        children: [
          {
            label: 'Level three 1-1-1'
          }
        ]
      }
    ]
  },
  {
    label: 'Level one 2',
    children: [
      {
        label: 'Level two 2-1',
        children: [
          {
            label: 'Level three 2-1-1'
          }
        ]
      },
      {
        label: 'Level two 2-2',
        children: [
          {
            label: 'Level three 2-2-1'
          }
        ]
      }
    ]
  },
  {
    label: 'Level one 3',
    children: [
      {
        label: 'Level two 3-1',
        children: [
          {
            label: 'Level three 3-1-1'
          }
        ]
      },
      {
        label: 'Level two 3-2',
        children: [
          {
            label: 'Level three 3-2-1'
          }
        ]
      }
    ]
  }
]

const defaultProps = {
  children: 'children',
  label: 'label'
}
</script>

<style lang="scss" scoped>
.channel {
  display: flex;
  width: 100%;
  height: 100%;
  > div.classify {
    width: 300px;
    height: 100%;
    background: var(--color-auxi-secondary);
    > div.title {
      padding: 0 16px;
      height: 68px;
      font-size: 16px;
      font-weight: bold;
      line-height: 70px;
      color: var(--color-text-primary);
      z-index: 10;
      border-bottom: 2px solid #202225;
    }
    > img.avatar {
      width: 300px;
      height: 200px;
      opacity: .8;
    }
    .el-tree {
      margin-top: 20px;
      background: none;
    }
  }
  > div.content {
    flex-grow: 1;
  }
}
</style>
