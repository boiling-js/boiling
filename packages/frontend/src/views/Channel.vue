<template>
  <div class="channel">
    <div v-show="$store.state.sidebarVisiable" class="classify">
      <div class="title">
        {{ channel?.name }}
        <el-dropdown trigger="click" placement="bottom-end">
          <span class="el-dropdown-link">
            <span class="menu material-icons">menu</span>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="$refs.selMembers.open([])">
                <el-icon><Avatar/></el-icon> 邀请好友
              </el-dropdown-item>
              <el-dropdown-item @click="subChannelForm.show = true">
                <el-icon><Plus/></el-icon> 创建类别
              </el-dropdown-item>
              <el-dropdown-item
                @click="() => $router.push({
                  path: '/create-channel',
                  query: {
                    type: 'setting',
                    info: JSON.stringify({
                      id: channel.id,
                      name: channel.name,
                      avatar: channel.avatar,
                      description: channel.description,
                    })
                  }
                })">
                <el-icon><Setting/></el-icon> 频道设置
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <img class="avatar" :src="channel?.avatar" alt="">
      <el-tree :data="subChannels"
               :props="{
                 children: 'chatRooms',
                 label: 'title'
               }"
               @node-click="handleNodeClick">
        <template #default="{ node }">
          {{ node.label }}
          <div class="operations">
            <el-icon
              v-if="node.level === 1"
              class="add"
              @click="() => $router.push({
                path: '/create-chatRoom',
                query: {
                  type: 'create',
                  channelId: channel.id,
                  channelTitle: node.label
                }
              })">
              <plus/>
            </el-icon>
            <!--<el-icon
              class="set" @click="() => {}">
              <setting/>
            </el-icon>-->
          </div>
        </template>
      </el-tree>
    </div>
    <div class="content">
      <chat-room
        v-if="chattingRoom.id"
        :id="chattingRoom.id"
        :title="chattingRoom.title"
      />
      <el-empty v-else description="快来聊天吧~" />
    </div>
    <el-dialog
      v-model="subChannelForm.show"
      title="创建子频道">
      <el-form
        label-width="100px"
        :model="subChannelForm">
        <el-form-item label="标题">
          <el-input v-model="subChannelForm.title" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="subChannelForm.show = false">取消</el-button>
          <el-button type="primary" @click="createSubChannel">确认</el-button>
        </span>
      </template>
    </el-dialog>
    <sel-members ref="selMembers" @confirm="members => addMember(members)"/>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import {
  ElTree,
  ElDialog,
  ElIcon,
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElEmpty
} from 'element-plus'
import { Avatar, Plus, Setting } from '@element-plus/icons-vue'
import { Channels } from '@boiling/core'
import { api } from '../api'
import SelMembers from '../components/SelMembers.vue'
import ChatRoom from './ChatRoom.vue'

const
  props = defineProps<{
    id: string
  }>(),
  channel = ref<Channels.Model | undefined>(),
  subChannels = computed(() => channel.value?.subChannels),
  subChannelForm = ref<{
    show: boolean,
    title: string,
  }>({
    show: false,
    title: ''
  }),
  chattingRoom = ref<Channels.ChatRoomMeta>({
    id: '',
    title: ''
  })
const
  getChannel = async () => {
    channel.value = await api.channel(props.id)
  },
  createSubChannel = async () => {
    await api.channel(props.id).subChannels.add({
      title: subChannelForm.value.title
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

onMounted(async () => {
  await getChannel()
})
const handleNodeClick = (data: Channels.ChatRoomMeta) => {
  if (data.id) {
    chattingRoom.value.id = data.id
    chattingRoom.value.title = data.title
  }
}

</script>

<style lang="scss" scoped>
div.channel {
  display: flex;
  width: 100%;
  height: 100%;
  > div.classify {
    height: 100%;
    max-width: 240px;
    min-width: 240px;
    background: var(--color-auxi-regular);
    > div.title {
      z-index: 10;
      display: flex;
      padding: 0 16px;
      height: 68px;
      line-height: 70px;
      color: var(--color-text-primary);
      font-size: 16px;
      font-weight: bold;
      border-bottom: 2px solid #202225;
      align-items: center;
      .el-dropdown {
        margin-left: auto;
        cursor: pointer;
      }
    }
    > img.avatar {
      width: 100%;
    }
    div.el-tree {
      margin-top: 20px;
      background: none;
      :deep(div.el-tree-node) {
        > div.el-tree-node__content {
          padding: 5px 40px 5px 5px;
          margin: 5px;
          border-radius: 4px;
          transition: 0.3s;
          &:hover {
            background-color: var(--color-auxi-secondary);
          }
          > div.operations {
            position: absolute;
            right: 10px;
            display: flex;
            align-items: center;
            column-gap: 5px;
            > i.el-icon {
              transition: 0.3s;
              &:hover {
                color: var(--color-primary);
              }
            }
          }
        }
        &.is-current > div.el-tree-node__content {
          background-color: var(--color-auxi-placeholder);
        }
      }
    }
  }
  > div.content {
    flex-grow: 1;
    background-color: var(--color-auxi-placeholder);
  }
}
</style>
