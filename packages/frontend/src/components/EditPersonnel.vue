<template>
  <div class="edit-personnel">
    <el-page-header :icon="ArrowLeft" title="返回" content="编辑个人信息" @back="$router.push('/home')" />
    <user
      :info="$store.state.user"
      :type="'popup'"/>
    <el-form ref="editPersonnelForm" :model="form" label-width="90px">
      <el-form-item label="用户名">
        <el-input
          v-model="form.name"/>
      </el-form-item>
      <el-form-item label="性别">
        <el-select v-model="form.sex" placeholder="点击选择性别">
          <el-option label="男" value="male"></el-option>
          <el-option label="女" value="female"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="出生日期">
        <el-date-picker
          v-model="form.birthday"
          type="date"
          placeholder="选择出生日期"
        ></el-date-picker>
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
import { ElPageHeader, ElForm,ElFormItem, ElSelect, ElOption, ElDatePicker, ElInput, ElButton } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { onMounted, onUnmounted, reactive } from 'vue'
import User from './User.vue'
import store from '../store'

// do not use same name with ref
const form = reactive({
  name: '',
  sex: '',
  birthday: '',
  delivery: false,
  type: [],
  resource: '',
  desc: ''
})

const onSubmit = () => {
  console.log('submit!')
}

onMounted(() => {
  store.commit('setLeftSelectorHidden', true)
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
    float: right;
    margin: 0 40px;
    width: 40%;
  }
}
</style>
