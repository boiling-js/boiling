<template>
  <div class="create-group">
    <el-dialog
      v-model="show"
      title="选择成员"
      width="62%"
      @close="close">
      <el-checkbox-group
        v-model="fIds"
        @change="handleChange">
        <el-checkbox
          v-for="friend in friends"
          :key="friend.id"
          :label="friend.id">
          <el-avatar
            :src="`/api${friend.avatar}`"
          />
          {{ friend.remark ||friend.username }}
        </el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="show = false">取消</el-button>
          <el-button type="primary" @click="confirm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { defineEmits, onMounted, ref } from 'vue'
import { ElDialog, ElButton, ElCheckboxGroup, ElCheckbox, ElAvatar } from 'element-plus'
import { api } from '../api'
import { Users } from '@boiling/core'

const
  emits = defineEmits<{
    (e: 'confirm', fIds: number[], fSel: Users.FriendOut[]): void
  }>(),
  show = ref<Boolean>(false),
  friends = ref<Users.FriendOut[]>([]),
  fIds = ref<number[]>([]),
  getFriends = async () => {
    friends.value = await api.user('@me').friends
  },
  handleChange = (
    value: number[]
  ) => {
    fIds.value = value
  },
  open = (existedIds: number[]) => {
    fIds.value = existedIds ?? []
    show.value = true
  },
  close = () => {
    show.value = false
  },
  confirm = () => {
    emits('confirm', fIds.value, friends.value.filter(f => fIds.value.includes(f.id)))
    show.value = false
  }

defineExpose({ open })
onMounted(() => getFriends())
</script>

<style lang="scss" scoped>
.create-group {
  padding: 20px;
  .el-dialog__body {
    .el-checkbox-group {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-around;
      align-items: center;
      .el-checkbox {
        margin: 10px;
        width: 130px;
        :deep(.el-checkbox__label) {
          display: flex;
          align-items: center;
          .el-avatar {
            margin-right: 10px;
          }
        }
      }
    }
  }
}
</style>
