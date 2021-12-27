<template>
  <div class="login-box">
    <div class="login">
      <h3 class="title">欢迎回来~</h3>
      <div class="login-input">
        <div class="label"> 账号： </div>
        <el-input v-model="account.account" placeholder="请输入账号" />
        <div class="label"> 账号： </div>
        <el-input v-model="account.password" placeholder="请输入密码" show-password />
        <div class="bottom-word">忘记密码？</div>
      </div>
      <el-button
        class="btn"
        type="primary"
        @click="login">
        登录
      </el-button>
      <div class="register">需要新的账号？ <span class="click" @click="register">注册</span></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElInput, ElButton,  ElMessage } from 'element-plus'
import axios from 'axios'

interface Account {
  account: string,
  password: string
}

const
  account = reactive<Account>({
    account: '',
    password: ''
  }),
  router = useRouter(),
  login = () => {
    router.push('/home')
    axios.post(`/api/users/${ account.account }/login`, {
      password: account.password
    })
      .then(function (response) {
        ElMessage.success('登录成功！')
        console.log(response)
      })
      .catch(function (error) {
        console.log(error)
      })
  },
  register = () => {
    router.push('/register')
  }

</script>

<style lang="scss" scoped>
.login-box {
  $w: 580px;
  $h: 320px;
  $p: 35px;
  >.login {
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
    > .login-input {
      > .label {
        margin: 10px;
      }
      > .bottom-word {
        margin: 5px;
        font-size: 10px;
        cursor: pointer;
        &:hover {
          color: var(--color-theme);
        }
      }
    }
    > .btn {
      margin: 10px 0;
      width: $w;
    }
    >.register {
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

