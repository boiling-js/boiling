<template>
  <div class="login">
    <div class="login-box">
      <h3 class="title">欢迎回来~</h3>
      <div class="login-input">
        <div class="label">账号：</div>
        <el-input v-model="account.id"
                  placeholder="请输入账号"/>
        <div class="label">密码：</div>
        <el-input v-model="account.password"
                  placeholder="请输入密码"
                  show-password
                  @keydown.enter="$refs.loginBtn.$el.click()"/>
        <div class="bottom-word">记住密码</div>
      </div>
      <el-button ref="loginBtn" type="primary" @click="login()
        .then(() => {
          $router.push('/home')
          $message.success('登陆成功')
        })" v-text="'登录'"/>
      <div class="register">
        需要新的账号？
        <span class="ln" @click="$router.push('/register')">注册</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useStore } from 'vuex'
import { onMounted, onUnmounted, reactive } from 'vue'
import { ElInput, ElButton } from 'element-plus'
import { Users } from '@boiling/core'
import { api } from '../api'
import { identifyWS, useWsClient } from '../hooks/useWsClient'

type Account = Users.Login & {
  id: string
}

const
  [wsClient] = useWsClient(),
  store = useStore(),
  account = reactive<Account>({
    id: import.meta.env.VITE_LOGIN_UID || '',
    status: 'online',
    password: import.meta.env.VITE_LOGIN_PWD || ''
  }),
  login = async () => {
    const { id, ...status } = account
    identifyWS(wsClient, id, account.password)
    store.commit('setUser', await api.user(+id).status.add(status))
  }

onMounted(() => {
  store.commit('setLeftSelectorHidden', true)
})
onUnmounted(() => {
  store.commit('toggleLeftSelector')
})
</script>

<style lang="scss" scoped>
.login {
  $w: 580px;
  $h: 320px;
  $p: 35px;

  background-image: url("../assets/img/bg/1.png");
  background-position: center;
  background-size: cover;
  > .login-box {
    position: fixed;
    top: calc(50vh - #{$h} / 2 - #{$p});
    left: calc(50% - #{$w} / 2 - #{$p});
    padding: $p;
    width: $w;
    height: $h;
    color: var(--color-text-primary);
    background-color: var(--color-auxi-primary);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
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
          color: var(--color-primary);
        }
      }
    }
    > .el-button {
      margin: 10px 0;
      width: $w;
    }
    > .register {
      font-size: 10px;
      > .ln {
        cursor: pointer;
        &:hover {
          color: var(--color-primary);
        }
      }
    }
  }
}
</style>

