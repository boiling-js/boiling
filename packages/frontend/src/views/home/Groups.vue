<template>
  <div class="groups">
    <div class="header">
      <el-input
        v-model="input2"
        class="search"
        placeholder="搜索群组"
        :prefix-icon="Search"
      />
      <span
        class="material-icons md-light add"
        @click="$refs.selMembers.open([])"
      >add</span>
    </div>
    <div class="groups-list">
      <group
        v-for="group in groups"
        :key="group.id"
        :group="group"
        @update="getGroups"/>
    </div>
  </div>
  <sel-members
    ref="selMembers"
    @confirm="(fIds) => createGroup(fIds)"
  />
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { ElInput, ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { api } from '../../api'
import { ChatRooms } from '@boiling/core'
import SelMembers from '../../components/SelMembers.vue'
import Group from '../../components/Group.vue'

const
  groups = ref<ChatRooms.Model[]>([]),
  getGroups = async () => {
    groups.value = await api.user('@me').groups
  },
  createGroup = async (members: number[]) => {
    await api['chat-rooms'].add({ members: members, name: members.join(',') })
    ElMessage({
      message: `${members.join(',')}聊天室创建成功！`,
      type: 'success'
    })
  }
onMounted(getGroups)
</script>

<style lang="scss" scoped>
.groups {
  padding: 10px;
  > .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 10px;
    height: 48px;
    border-bottom: 2px solid #e4e7ed;
    > .el-input {
      width: 300px;
    }
    > span.add { cursor: pointer; }
  }
}
</style>
