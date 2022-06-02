<template>
  <el-dialog
    v-model="show"
    title="更换头像">
    <div class="avatar-uploader" @click="upload">
      <img v-if="avatar" :src="avatar" class="avatar" >
      <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
      <input ref="selFile" type="file" style="display: none;">
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="show = false">取消</el-button>
        <el-button type="primary" @click="confirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { defineProps, ref } from 'vue'
import { ElIcon, ElDialog,ElButton } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const
  props = defineProps({
    avatar: {
      type: String,
      default: ''
    }
  }),
  emits = defineEmits<{
    (e: 'selAvatar', avatar: string): void
  }>(),
  show = ref<Boolean>(false),
  avatar = ref<string | null>(props.avatar),
  selFile = ref<HTMLInputElement | null>(null)
const
  open = () => {
    show.value = true
  },
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
          avatar.value = `/api/uploads/${ files[0] }`
        })
    }
    selFile.value?.click()
  },
  confirm = () => {
    emits('selAvatar', avatar.value ?? '')
    show.value = false
  }
  defineExpose({ open })
</script>

<style scoped lang="scss">
.avatar-uploader {
  margin: 0 auto;
  width: 120px;
  height: 120px;
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
</style>
