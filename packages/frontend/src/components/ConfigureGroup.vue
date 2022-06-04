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
      <el-form-item label="成员：">
        <div
          v-for="member in members"
          :key="member.id"
          class="friend">
          <el-avatar
            :src="`${member.avatar}`"
          />
          <div class="name">{{ member.remark || member.username }}</div>
        </div>
        <div class="friend">
          <el-avatar>
            <span
              class="material-icons md-light add"
              @click="$refs.selMembers.open(members.map(member => member.id))">
              add
            </span>
          </el-avatar>
          <div class="name">添加</div>
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
                   @click="dropGroup"
                   v-text="'确认'"/>
      </div>
      <el-divider/>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="show = false">取消</el-button>
        <el-button type="primary" @click="confirm">确认</el-button>
      </span>
    </template>
    <sel-members
      ref="selMembers"
      @confirm="(fIds, fSel) => addMembers(fIds, fSel)"
    />
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ElDialog, ElForm, ElInput, ElFormItem, ElButton, ElDivider, ElAvatar, ElMessageBox } from 'element-plus'
import { ChatRooms, Users } from '@boiling/core'
import { api } from '../api'
import SelMembers from './SelMembers.vue'

const
  show = ref<Boolean>(false),
  members = ref<Users.FriendOut[]>([]),
  open = async (data: ChatRooms.Model) => {
    form.value = JSON.parse(JSON.stringify(data))
    members.value = await api['chat-room'](form.value?.id ?? '').members
    show.value = true
  },
  form = ref<ChatRooms.Model>(),
  addMembers = (fIds: number[], fSel: Users.FriendOut[]) => {
    members.value = members.value.concat(fSel.filter(f => !members.value.some(m => m.id === f.id)))
  },
  confirm = async () => {
   await api['chat-room'](form.value?.id ?? '').upd({
      name: form.value?.name,
      members: members.value.map(m => m.id)
    })
    show.value = false
  },
  dropGroup = async() => {
    await ElMessageBox.confirm(
      '是否确认退出群聊？', '确认', {
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }
    )
    await api['chat-room'](form.value?.id ?? '').member('@me').del()
    show.value = false
  }

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
      &:last-child {
        cursor: pointer;
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
