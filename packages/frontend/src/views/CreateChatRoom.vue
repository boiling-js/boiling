<template>
  <div class="create-chatRoom">
    <div class="content">
      <div class="title">{{ props.type === 'create' ? '新建聊天室' : '设置聊天室' }}</div>
      <div class="avatar-uploader" @click="upload">
        <img v-if="chatRoom.avatar" :src="chatRoom.avatar" class="avatar" >
        <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        <input ref="selFile" type="file" style="display: none;">
      </div>
      <el-form :model="chatRoom" label-position="top">
        <el-form-item label="聊天室名称">
          <el-input v-model="chatRoom.name" />
        </el-form-item>
        <el-form-item label="频道介绍">
          <el-input
            v-model="chatRoom.description"
            type="textarea"
            :autosize="{ minRows: 6, maxRows: 10 }"
          />
        </el-form-item>
        <el-form-item label="成员">
          <div
            v-for="member in members"
            :key="member.id"
            class="friend">
            <el-avatar
              :src="`/api${member.avatar}`"
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
      <div class="bottom">
        <el-button @click="$router.back()">取消</el-button>
        <el-button type="primary" @click="confirm">确认</el-button>
      </div>
    </div>
    <avatar/>
    <sel-members
      ref="selMembers"
      @confirm="(fIds, fSel) => addMembers(fIds, fSel)"
    />
  </div>
</template>

<script lang="ts" setup>
import {  onMounted, ref } from 'vue'
import {  ElIcon, ElForm, ElFormItem, ElInput, ElButton, ElMessage, ElAvatar } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import Avatar from '../components/Avatar.vue'
import { api } from '../api'
import { ChatRooms, Users } from '@boiling/core'
import SelMembers from '../components/SelMembers.vue'

const
  props = withDefaults(defineProps<{
    type?: 'create' | 'setting'
    info?: string
    channelId?: string
    channelTitle?: string
  }>(), {
    type: 'create',
    info: '',
    channelId: '',
    channelTitle: ''
  }),
  chatRoom = ref<Pick<ChatRooms.Model, 'id' | 'name' | 'avatar' | 'members'> & {
    description?: string
  }>({
    id: '',
    name: '',
    members: [],
    avatar: '',
    description: ''
  }),
  members = ref<Users.FriendOut[]>([]),
  selFile = ref<HTMLInputElement | null>(null)
const
  upload = () => {
    if (!selFile.value)
      return
    selFile.value.onchange = () => {
      if (!selFile.value)
        return

      const formData = new FormData()
      for (let i = 0; i < (selFile.value.files?.length ?? 0); i++) {
        const file = selFile.value.files?.[i]
        file && formData.append(`file-${ i }`, file)
      }
      fetch('/api/common/upload', { method: 'POST', body: formData })
        .then(r => r.json())
        .then((files: string[]) => {
          chatRoom.value.avatar = `/api/uploads/${ files[0] }`
        })
    }
    selFile.value?.click()
  },
  addMembers = (fIds: number[], fSel: Users.FriendOut[]) => {
    members.value = members.value.concat(fSel.filter(f => !members.value.some(m => m.id === f.id)))
  },
  confirm = async () => {
    if (props.type === 'create') {
      const chat = await api['chat-rooms'].add({
        name: chatRoom.value.name,
        avatar: chatRoom.value.avatar,
        members: members.value.map(m => m.id),
        channelId: props.channelId
      })
      // 存在channelId 则为频道聊天室，需要加入到频道中
      if (props.channelId) {
        await api.channel(props.channelId).chatRoom(chat.id).add({
          title: props.channelTitle,
          chatRoomTitle: chat.name,
          description: chatRoom.value.description
        })
      }
      ElMessage.success('创建成功')
    } else if (props.type === 'setting') {
      // await api.channel(chatRoom.value.id).upd(channel.value)
      ElMessage.success('更新成功')
    }
  }

onMounted(async () => {
  if (props.type === 'setting') {
    chatRoom.value = JSON.parse(props.info)
    members.value = await api['chat-room'](chatRoom.value?.id ?? '').members
  }
})
</script>

<style lang="scss" scoped>
.create-chatRoom {
  > div.content {
    position: relative;
    margin: 0 auto;
    padding: 20px;
    width: 480px;
    height: calc(100% - 60px);
    > div.title {
      color: var(--color-text-secondary);
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 20px;
    }
    > div.avatar-uploader {
      margin: 0 auto;
      width: 178px;
      height: 178px;
      display: block;
      border: 1px dashed var(--el-border-color);
      border-radius: 50%;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: var(--el-transition-duration-fast);
      > .avatar {
        width: 100%;
        height: 100%;
      }
    }

    .avatar-uploader .el-upload:hover {
      border-color: var(--color-auxi-placeholder);
    }

    .el-icon.avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 178px;
      height: 178px;
      text-align: center;
    }
    > div.bottom {
      position: absolute;
      width: 152px;
      right: 0;
      bottom: 20px;
    }
  }
}
@media screen and (max-width: 600px) {
  .create-chatRoom{
    > div.content {
      width: calc(100% - 40px);
    }
  }
}
</style>
