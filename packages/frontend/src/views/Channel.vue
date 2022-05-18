<template>
  <div class="channel">
    <div class="classify">
      <div class="title">
        {{ props.title }}
        <el-dropdown trigger="click">
          <span class="el-dropdown-link">
            <span class="menu material-icons">menu</span>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="$refs.selMembers.open([])">邀请好友</el-dropdown-item>
              <el-dropdown-item @click="subChannelForm.show = true">创建类别</el-dropdown-item>
              <el-dropdown-item>频道设置</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <img class="avatar" :src="channel?.avatar" alt="">
      <el-tree :data="subChannels" :props="defaultProps" @node-click="handleNodeClick">
        <template #default="{ node }">
          {{ node.label }}
          <span class="add material-icons"
                @click="() => {}">add</span>
        </template>
      </el-tree>
    </div>
    <div class="content"/>
    <el-dialog
      v-model="subChannelForm.show"
      title="创建子频道">
      <el-form
        label-width="100px"
        :model="subChannelForm">
        <el-form-item label="标题">
          <el-input v-model="subChannelForm.subTitle" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="subChannelForm.show = false">取消</el-button>
          <el-button type="primary" @click="createSubChannel">确认</el-button>
        </span>
      </template>
    </el-dialog>
    <selMembers ref="selMembers" @confirm="members => addMember(members)"/>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, ref } from 'vue'
import {
  ElTree,
  ElDialog,
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem
} from 'element-plus'
import { Channels } from '@boiling/core'
import { api } from '../api'
import SelMembers from '../components/SelMembers.vue'

const
  props = defineProps<{
    id: string
    title: string
  }>(),
  defaultProps = {
    children: 'chatRooms',
    label: 'subTitle'
  },
  channel = ref<Channels.Model>(),
  subChannels = ref<Channels.SubChannelMeta[]>([]),
  subChannelForm = ref<{
    show: boolean,
    subTitle: string,
  }>({
    show: false,
    subTitle: ''
  })
const
  getChannel = async () => {
    channel.value = await api.channel(props.id)
    subChannels.value = channel.value.subChannel
  },
  createSubChannel = async () => {
    await api.channel(props.id).subChannel.add({
      subTitle: subChannelForm.value.subTitle
    })
    await getChannel()
    subChannelForm.value.show = false
    ElMessage.success('创建成功')
  },
  addMember = async (members: number[]) => {
    await api.channel(props.id).members.add({
      members: members.map(m => ({
         id: m
       }))
    })
    await getChannel()
  }

onMounted(() => {
  nextTick(async () => {
    await getChannel()
  })
})
const handleNodeClick = (data: Channels.SubChannelMeta) => {
  console.log(data)
}

</script>

<style lang="scss" scoped>
.channel {
  display: flex;
  width: 100%;
  height: 100%;
  > div.classify {
    width: 300px;
    height: 100%;
    background: var(--color-auxi-secondary);
    > div.title {
      display: flex;
      align-items: center;
      padding: 0 16px;
      height: 68px;
      font-size: 16px;
      font-weight: bold;
      line-height: 70px;
      color: var(--color-text-primary);
      z-index: 10;
      border-bottom: 2px solid #202225;
      .el-dropdown {
        margin-left: auto;
        cursor: pointer;
      }
    }
    > img.avatar {
      width: 300px;
      height: 200px;
      opacity: .8;
    }
    .el-tree {
      margin-top: 20px;
      background: none;
      :deep(.el-tree-node__content) {
        .add {
          margin-left: auto;
          margin-right: 10px;
        }
      }
    }
  }
  > div.content {
    flex-grow: 1;
  }
}
</style>
