<template>
  <el-dialog
    v-model="showDialog"
    title="更换头像"
    width="60%">
    <el-upload
      class="avatar-uploader"
      action="https://jsonplaceholder.typicode.com/posts/"
      :show-file-list="false"
      :on-success="handleAvatarSuccess"
      :before-upload="beforeAvatarUpload"
    >
      <img v-if="imageUrl" :src="imageUrl" class="avatar" />
      <el-icon v-else class="avatar-uploader-icon"><plus /></el-icon>
    </el-upload>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { ElDialog } from 'element-plus'

import type {
  UploadFile,
  ElUploadProgressEvent,
  ElFile
} from 'element-plus/es/components/upload/src/upload.type'

const showDialog = ref<Boolean>(false),
  show = () => {
    showDialog.value = true
  }
const imageUrl = ref('')
const handleAvatarSuccess = (res: ElUploadProgressEvent, file: UploadFile) => {
  imageUrl.value = URL.createObjectURL(file.raw)
}
const beforeAvatarUpload = (file: ElFile) => {
  const isJPG = file.type === 'image/jpeg'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('Avatar picture must be JPG format!')
  }
  if (!isLt2M) {
    ElMessage.error('Avatar picture size can not exceed 2MB!')
  }
  return isJPG && isLt2M
}
defineExpose({ show })
</script>

<style scoped lang="scss">
.avatar-uploader .el-upload {
  position: relative;
  border: 1px dashed #d9d9d9;
  overflow: hidden;
  border-radius: 6px;
  cursor: pointer;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
