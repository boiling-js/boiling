<template>
  <div class="user-info-card">
    <div class="avatar">
      <img :src="`/api/${info.avatar}`" alt="">
    </div>
    <div class="info">
      ID：{{ info.id }}
      <br>
      昵称：{{ info.username }}
    </div>
    <div class="operate">
      <span
        class="add material-icons"
        @click="addUserDialog = true">add</span>
    </div>
    <el-dialog
      v-model="addUserDialog"
      title="好友设置"
      width="60%">
      <el-form ref="formRef" :model="addUserForm" label-width="120px">
        <el-form-item label="备注：">
          <el-input v-model="addUserForm.remark"></el-input>
        </el-form-item>
        <el-form-item label="标签：">
          <el-select v-model="addUserForm.tags" multiple placeholder="请选择标签">
            <el-option
              v-for="item in addUserForm.tags"
              :key="item"
              :label="item"
              :value="item" >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addUserDialog = false">取消</el-button>
          <el-button type="primary" @click="add">下一步</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Users } from '@boiling/core'
import { ElDialog, ElInput, ElFormItem, ElSelect, ElOption, ElButton, ElMessageBox } from 'element-plus'
import { api } from '../api'
import { reactive, ref } from 'vue'

const
  props = defineProps<{
    info: Users.Out
  }>(),
  addUserDialog = ref(false),
  addUserForm = reactive<Omit<Users.Friend, 'id'>>({
    tags: [],
    remark: ''
  }),
  add = () => {
    ElMessageBox.confirm(
      `是否确认添加${ props.info.username }为好友？`,
      '确认',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }
    ).then(async () => {
      await api.user('@me').friend(props.info.id).add({
        tags: addUserForm.tags,
        remark: addUserForm.remark
      })
    }).catch()
  }
console.log(props.info)
</script>

<style lang="scss" scoped>
.user-info-card {
  display: flex;
  padding: 10px;
  width: calc(100% - 20px);
  height: 50px;
  background-color: var(--color-auxi-regular);
  border-radius: 6px;
  > div.avatar {
    margin-right: 10px;
    width: 50px;
    height: 50px;
    overflow: hidden;
    border-radius: 50%;
    > img {
      width: 100%;
      height: 100%;
    }
  }
  > div.info {
    flex-grow: 1;
  }
  > div.operate {
    > span {
      cursor: pointer;
    }
  }
}
</style>
