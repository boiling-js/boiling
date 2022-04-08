<template>
  <div class="create-group">
    <el-dialog
      v-model="show"
      title="创建讨论组"
      width="62%"
      @close="close">
      <el-transfer
        v-model="leftValue"
        filterable
        :render-content="render"
        :titles="['可选好友', '已选好友']"
        :props="{
          key: 'id',
          label: 'username',
        }"
        :format="{
          noChecked: '${total}',
          hasChecked: '${checked}/${total}',
        }"
        :data="friends"
        @change="handleChange"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="show = false">取消</el-button>
          <el-button type="primary" @click="confirm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { VNode, VNodeProps } from 'vue'
import { ElDialog, ElTransfer, ElButton, ElMessage } from 'element-plus'
import { api } from '../api'
import { Users } from '@boiling/core'

const
  show = ref<Boolean>(false),
  friends = ref<Users.FriendOut[]>([]),
  getFriends = async () => {
    friends.value = await api.user('@me').friends
  },
  leftValue = ref([]),
  rightValue = ref<number[]>([]),

  render = (
    h: (type: string, props: VNodeProps | null, children?: string) => VNode,
    friend: Users.FriendOut
  ) => {
    return h('span', null, friend.remark || friend.username)
  },
  handleChange = (
    value: number[]
  ) => {
    rightValue.value = value
  },
  open = () => {
    show.value = true
  },
  close = () => {
    show.value = false
  },
  confirm = async () => {
    await api['chat-rooms'].add({ members: rightValue.value, name: rightValue.value.join(',') })
    ElMessage({
      message: `${rightValue.value.join(',')}聊天室创建成功！`,
      type: 'success'
    })
  }

defineExpose({ open })
onMounted(() => getFriends())
</script>

<style scoped>
.create-group {
  padding: 20px;
}
</style>
