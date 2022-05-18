<template>
  <div class="create-channel">
    <div class="content">
      <div class="title">{{ props.type === 'create' ? '新建频道' : '设置频道' }}</div>
      <div class="avatar-uploader" @click="upload">
        <img v-if="channel.avatar" :src="channel.avatar" class="avatar" >
        <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        <input ref="selFile" type="file" style="display: none;">
      </div>
      <el-form :model="channel" label-position="top">
        <el-form-item label="频道名称">
          <el-input v-model="channel.name" />
        </el-form-item>
        <el-form-item label="频道介绍">
          <el-input
            v-model="channel.description"
            type="textarea"
            :autosize="{ minRows: 6, maxRows: 10 }"
          />
        </el-form-item>
      </el-form>
      <div class="bottom">
        <el-button @click="$router.back()">取消</el-button>
        <el-button type="primary" @click="confirm">确认</el-button>
      </div>
    </div>
    <avatar/>
  </div>
</template>

<script lang="ts" setup>
import {  onMounted, ref } from 'vue'
import {  ElIcon, ElForm, ElFormItem, ElInput, ElButton, ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import Avatar from './Avatar.vue'
import { api } from '../api'
import { Channels } from '@boiling/core'

const
  props = withDefaults(defineProps<{
    type?: 'create' | 'setting',
    info?: string
  }>(), {
    type: 'create',
    info: ''
  }),
  channel = ref<Pick<Channels.Model, 'id' | 'name' | 'avatar' | 'description'>>({
    id: '',
    name: '',
    description: '',
    avatar: ''
  }),
  selFile = ref<HTMLInputElement | null>(null)
const
  upload = () => {
    if (!selFile.value)
      return
    selFile.value.onchange = () => {
      if (!selFile.value)
        return

      const formData = new FormData()
      for (let i = 0; i < (selFile.value.files?.length ?? 0); i++) {
        const file = selFile.value.files?.[i]
        file && formData.append(`file-${ i }`, file)
      }
      fetch('/api/common/upload', { method: 'POST', body: formData })
        .then(r => r.json())
        .then((files: string[]) => {
          channel.value.avatar = `/api/uploads/${ files[0] }`
        })
    }
    selFile.value?.click()
  },
  confirm = async () => {
    if (props.type === 'create') {
      await api.channels.add(channel.value)
      ElMessage.success('创建成功')
    } else if (props.type === 'setting') {
      await api.channel(channel.value.id).upd(channel.value)
      ElMessage.success('更新成功')
    }
  }

onMounted(() => {
  if (props.type === 'setting') {
    channel.value = JSON.parse(props.info)
  }
})
</script>

<style lang="scss" scoped>
.create-channel {
  > div.content {
    position: relative;
    margin: 0 auto;
    padding: 20px;
    width: 480px;
    height: calc(100% - 60px);
    > div.title {
      color: var(--color-text-secondary);
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 20px;
    }
    > div.avatar-uploader {
      margin: 0 auto;
      width: 178px;
      height: 178px;
      display: block;
      border: 1px dashed var(--el-border-color);
      border-radius: 50%;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: var(--el-transition-duration-fast);
      > .avatar {
        width: 100%;
        height: 100%;
      }
    }

    .avatar-uploader .el-upload:hover {
      border-color: var(--color-auxi-placeholder);
    }

    .el-icon.avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 178px;
      height: 178px;
      text-align: center;
    }
    > div.bottom {
      position: absolute;
      width: 152px;
      right: 0;
      bottom: 20px;
    }
  }
}
@media screen and (max-width: 600px) {
  .create-channel {
    > div.content {
      width: calc(100% - 40px);
    }
  }
}
</style>
