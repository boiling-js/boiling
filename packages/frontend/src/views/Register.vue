<template>
  <div class="register-box">
    <div class="register">
      <h3 class="title">注册账号</h3>
      <el-form
        ref="ruleForm"
        :model="newAccount"
        :rules="rules"
        label-width="120px"
        class="demo-ruleForm"
        label-position="top"
        size="small">
        <el-form-item label="用户名:" prop="username" required>
          <el-input v-model="newAccount.username"></el-input>
        </el-form-item>
        <el-form-item label="密码:" prop="password" required>
          <el-input v-model="newAccount.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码:" prop="confirmPassword" required>
          <el-input v-model="newAccount.confirmPassword" type="password"></el-input>
        </el-form-item>
      </el-form>
      <el-button
        class="btn"
        type="primary"
        @click="register">确认</el-button>
      <div class="login">已有账号？ <span class="click" @click="login">直接登录</span></div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElForm, ElFormItem, ElInput, ElButton, ElMessageBox, ElMessage } from 'element-plus'
import { api } from '../api'
import { Users } from '@boiling/core'

type NewAccount =  Users.Register & {
  confirmPassword: string
}

const newAccount = reactive<NewAccount>({
  username: '',
  password: '',
  confirmPassword: ''
}),
  router = useRouter(),
  rules = {
    username: {
      required: true,
      message: '请输入用户名',
      trigger: 'blur'
    },
    password: {
      required: true,
      message: '请输入密码',
      trigger: 'blur'
    },
    confirmPassword: {
      required: true,
      message: '请输入确认密码',
      trigger: 'blur'
    }
  },
  login = () => {
    router.push('/login')
  },
  openMessageBox = (id: number) => {
    ElMessageBox.alert(`账号已成功注册，${id}为您的登录账号`, '提醒', {
      confirmButtonText: '确认',
      callback: () => {
        login()
      }
    })
  },
  register = async () => {
    try {
      if (newAccount.password !== newAccount.confirmPassword)
        throw new Error('密码不一致，请保持密码与确认密码一致')
      const { confirmPassword: _, ...register } = newAccount
      const resp = await api.users.add(register)
      openMessageBox(resp.id)
      ElMessage.success('账号注册成功！')
    } catch (e) {
      if (e instanceof Error)
        ElMessage.error(e.toString())
      else
        throw e
    }
  }
</script>

<style lang="scss" scoped>
.register-box {
  $w: 50vh;
  $h: 55vh;
  $p: 40px;
  > .register {
    position: fixed;
    top: calc(50vh - #{$h} / 2 - #{$p});
    left: calc(50% - #{$w} / 2 - #{$p});
    padding: $p;
    width: $w;
    height: $h;
    color: var(--color-title-default);
    background-color: var(--bg-color-theme);
    border-radius: var(--border-radius-default);
    box-shadow: var(--box-shadow-default);
    > .title {
      text-align: center;
    }
    > .btn {
      margin: 10px 0;
      width: $w;
    }
    > .login {
      font-size: 10px;
      > .click {
        cursor: pointer;
        &:hover {
          color: var(--color-theme);
        }
      }
    }
  }
}
</style>
