<template>
  <div class="edit-personnel">
    <el-page-header :icon="ArrowLeft" title="返回" content="编辑个人信息" @back="$router.push('/home')" />
    <user-info
      :info="store.state.user"
      :type="'popup'"/>
    <el-form ref="editPersonnelForm" :model="form" label-width="80px">
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
    <div class="bottom">
      <el-button type="primary" @click="onSubmit">确认</el-button>
      <el-button @click="$router.push('/home')">取消</el-button>
    </div>
  </div>
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
  ElMessage
} from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import store from '../store'
import { Users } from '@boiling/core'
import UserInfo from './User.vue'

const
  user = computed(() => store.state.user),
  form = ref<Users.UpdateOut>({
  username: '',
  sex: 'female',
  birthday: '',
  desc: ''
})

const onSubmit = async () => {
  await store.dispatch('update', form.value)
  ElMessage.success('更新成功！')
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
  > div.bottom {
    position: absolute;
    right: 40px;
    bottom: 60px;
  }
  > .user {
    margin-left: 90px;
    margin-bottom: 20px;
    width: calc(100% - 110px);
  }
}
</style>
