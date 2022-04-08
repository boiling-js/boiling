<template>
  <el-dialog
    v-model="show"
    title="修改群组">
    <el-form
      :model="form"
      label-width="80px"
      label-position="top"
      class="configure-group">
      <el-form-item label="群名：">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="好友：">
        <div class="friend">
          <div class="avatar">头像</div>
          <div class="name">名字</div>
        </div>
      </el-form-item>
    </el-form>
    <div
      class="other-operate">
      <el-divider content-position="left">危险操作</el-divider>
      <div class="operate">
        <div class="desc">
          <div class="title">退出群聊</div>
          退出群聊后，你将不会收到该群消息。
        </div>
        <el-button type="danger"
                   @click="()=>{}"
                   v-text="'确认'"/>
      </div>
      <el-divider/>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="show = false">取消</el-button>
        <el-button type="primary" @click="show = false">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElDialog, ElForm, ElInput, ElFormItem, ElButton, ElDivider } from 'element-plus'
const
  show = ref<Boolean>(false),
  open = () => {
    show.value = true
  },
  form = reactive({
    name: '',
    region: '',
    date1: '',
    date2: '',
    delivery: false,
    type: [],
    resource: '',
    desc: ''
  })
defineExpose({ open })
</script>

<style scoped lang="scss">
:deep(.el-form-item) {
  > .el-form-item__content {
    display: flex;
    align-items: center;
    > div.friend {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 0 10px;
      > div.avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
      }
    }
  }
}
.other-operate {
  > div.operate {
    display: flex;
    justify-content: space-between;
    > div.desc {
      color: var(--color-text-secondary);
      > div.title {
        color: var(--el-text-color-regular);
        font-size: 16px;
        font-weight: bold;
      }
    }
    > div.el-button {
      float: right;
    }
  }
}
</style>
