<template>
  <div class="edit-personnel">
    <el-page-header :icon="ArrowLeft" title="返回" content="编辑个人信息" @back="$router.push('/home')" />
    <el-avatar
      class="avatar"
      :size="120"
      :src="`${store.state.user.avatar}`"
      @click="$refs.uploader.open()"
    />
    <el-divider content-position="left">基本信息</el-divider>
    <el-form ref="editPersonnelForm" :model="form" label-width="75px">
      <el-form-item label="用户名">
        <el-input
          v-model="form.username"/>
      </el-form-item>
      <el-form-item label="性别">
        <el-select v-model="form.sex" placeholder="点击选择性别">
          <el-option label="男" value="male"/>
          <el-option label="女" value="female"/>
        </el-select>
      </el-form-item>
      <el-form-item label="出生日期">
        <el-date-picker
          v-model="form.birthday"
          type="date"
          placeholder="选择出生日期"
        />
      </el-form-item>
      <el-form-item label="个人简介">
        <el-input v-model="form.desc" type="textarea" rows="6"/>
      </el-form-item>
    </el-form>
    <el-divider content-position="left">密码</el-divider>
    <el-button type="primary" @click="pwd.show = true">更改密码</el-button>
    <div class="bottom">
      <el-button type="primary" @click="onSubmit">确认</el-button>
      <el-button @click="$router.push('/home')">取消</el-button>
    </div>
  </div>
  <el-dialog v-model="pwd.show" title="更改密码">
    <el-form :model="pwd" label-width="100px" label-position="top">
      <el-form-item label="当前密码">
        <el-input v-model="pwd.oldPwd" type="password"/>
      </el-form-item>
      <el-form-item label="新密码">
        <el-input v-model="pwd.newPwd" type="password" />
      </el-form-item>
      <el-form-item label="确认新密码">
        <el-input v-model="pwd.confirmPwd" type="password"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="pwd.show = false">取消</el-button>
        <el-button type="primary" @click="changePwd">确认</el-button>
      </span>
    </template>
  </el-dialog>
  <uploader-avatar
    ref="uploader"
    :avatar="user.avatar"
    @selAvatar="(selAvatar) => changeAvatar(selAvatar)"/>
</template>

<script lang="ts" setup>
import {
  ElPageHeader,
  ElForm,
  ElFormItem,
  ElSelect,
  ElOption,
  ElDatePicker,
  ElInput,
  ElButton,
  ElMessage,
  ElAvatar,
  ElDivider,
  ElDialog
} from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import store from '../store'
import { Users } from '@boiling/core'
import UploaderAvatar from '../components/UploaderAvatar.vue'
import { ElMessageBox } from 'element-plus'
import { api } from '../api'

type PWD = {
  show: boolean
  oldPwd: string,
  newPwd: string,
  confirmPwd: string
}

const
  user = computed(() => store.state.user),
  form = ref<Users.UpdateOut>({
    username: '',
    sex: 'female',
    birthday: '',
    desc: ''
  }),
  pwd = ref<PWD>({
    show: false,
    oldPwd: '',
    newPwd: '',
    confirmPwd: ''
  })

const
  onSubmit = async () => {
    await store.dispatch('update', form.value)
    ElMessage.success('更新成功！')
  },
  changeAvatar = async (avatar: string) => {
    await ElMessageBox.confirm(
      '是否确认更换头像？', '确认', {
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }
    )
    await store.dispatch('updAvatar', avatar)
  },
  changePwd = async () => {
    if (pwd.value.newPwd !== pwd.value.confirmPwd) {
      ElMessage.error('两次输入的密码不一致！')
      return
    }
    await api.user('@me').password.upd({
      oldPwd: pwd.value.oldPwd, newPwd: pwd.value.newPwd
    })
    ElMessage.success('密码更改成功！')
    pwd.value.show = false
  }

onMounted(() => {
  store.commit('setLeftSelectorHidden', true)
  form.value = {
    username: user.value.username,
    sex: user.value.sex,
    birthday: user.value.birthday,
    desc: user.value.desc
  }
})
onUnmounted(() => {
  store.commit('toggleLeftSelector')
})

</script>

<style lang="scss" scoped>
.edit-personnel {
  padding: 20px;
  width: calc(100% - 40px);
  height: calc(100% - 40px);
  .el-page-header {
    margin-bottom: 20px;
  }
  > .avatar {
    margin: 0 auto;
    display: block;
    cursor: pointer;
  }
  > .el-form {
    > .el-form-item {
      ::v-deep(.el-input) {
        width: 212px;
      }
    }
  }
  > div.bottom {
    position: absolute;
    right: 40px;
    bottom: 60px;
  }
}
</style>
