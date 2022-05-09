<template>
  <el-dialog
    v-model="isShow"
    class="configure-friend"
    title="好友设置"
    width="85%">
    <el-divider content-position="left">基本信息</el-divider>
    <div class="basic-info">
      <div class="info">
        <div class="label">账号：</div>
        <div class="content">{{ info.id }}</div>
      </div>
      <div class="info">
        <div class="label">昵称：</div>
        <div class="content">{{ info.username }}</div>
      </div>
      <div class="info">
        <div class="label">性别：</div>
        <div class="content">{{ info.sex === 'female' ? '女' : '男' }}</div>
      </div>
      <div class="info">
        <div class="label">出生日期：</div>
        <div class="content">{{ info.birthday }}</div>
      </div>
    </div>
    <el-divider content-position="left">设置操作</el-divider>
    <el-form ref="formRef" :model="settingUserForm" label-width="60px">
      <el-form-item label="备注：">
        <el-input v-model="settingUserForm.remark"/>
      </el-form-item>
      <el-form-item label="标签：">
        <el-select
          v-model="settingUserForm.tags"
          multiple
          placeholder="请选择标签"
          style="margin-right: 10px;">
          <el-option v-for="item in tags" :key="item"
                     :label="item" :value="item"/>
        </el-select>
        <el-input
          v-if="tagInputVisible"
          ref="tagInputRef"
          v-model="tagInputValue"
          class="ml-1 w-20"
          style="margin: 5px 0; width: 90px;"
          @keyup.enter="handleInputConfirm"
          @blur="tagInputVisible = false"/>
        <el-button
          v-else
          class="button-new-tag" style="margin: 5px 0; width: 90px;" @click="showInput">
          + 新标签
        </el-button>
      </el-form-item>
    </el-form>
    <div
      v-if="props.isFriend"
      class="other-operate">
      <el-divider content-position="left">危险操作</el-divider>
      <div class="operate">
        <div class="desc">
          <div class="title">删除好友</div>
          删除好友后，对方将不在你的好友列表中。
        </div>
        <el-button type="danger"
                   @click="delFriend"
                   v-text="'确认'"/>
      </div>
      <el-divider/>
      <div class="operate">
        <div class="desc">
          <div class="title">拉入黑名单</div>
          拉入黑名单后，你将无法接收到对方的消息。
        </div>
        <el-button type="danger"
                   v-text="'确认'"/>
      </div>
      <el-divider/>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="isShow = false">取消</el-button>
        <el-button
          v-if="!props.isFriend"
          type="primary" @click="add">下一步</el-button>
        <el-button
          v-else
          type="primary" @click="settingFriend">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { Users } from '@boiling/core'
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useStore } from 'vuex'
import { ElDialog, ElInput, ElForm, ElFormItem, ElSelect, ElOption, ElButton, ElMessageBox, ElMessage, ElDivider } from 'element-plus'
import { api } from '../api'

const
  store = useStore(),
  props = defineProps<{
    info: Users.Out | Users.FriendOut,
    isFriend: boolean
  }>(),
  isShow = ref(false),
  tags = computed(() => store.state.user.tags),
  settingUserForm = reactive<Omit<Users.Friend, 'id'>>({
    tags: [],
    remark: ''
  }),
  tagInputVisible = ref(false),
  tagInputValue = ref(''),
  tagInputRef = ref<InstanceType<typeof ElInput>>(),
  showInput = () => {
    tagInputVisible.value = true
    nextTick(() => {
      tagInputRef.value!.input!.focus()
    })
  },
  handleInputConfirm = async () => {
    await ElMessageBox.confirm(
      `是否确认新建标签${ tagInputValue.value }？`, '确认', {
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }
    )
    await api.user('@me').tag.add({ tag: tagInputValue.value })
    ElMessage.success('标签添加成功！')
    settingUserForm.tags?.push(tagInputValue.value)
    store.state.user.tags.push(tagInputValue.value)
    tagInputVisible.value = false
    tagInputValue.value = ''
  },
  add = async () => {
    try {
      await ElMessageBox.confirm(
        `是否确认添加${ props.info.username }为好友？`, '确认', {
          confirmButtonText: '确认',
          cancelButtonText: '取消'
        }
      )
      await store.dispatch('addFriend', {
        id: props.info.id,
        tags: settingUserForm.tags,
        remark: settingUserForm.remark
      })
      isShow.value = false
      ElMessage.success('请求发送成功！')
    } catch {}
  },
  settingFriend = async () => {
    await api.user('@me').friend(props.info.id).upd({
      tags: settingUserForm.tags,
      remark: settingUserForm.remark
    })
    isShow.value = false
    ElMessage.success('好友设置成功！')
  },
  show = () => {
    isShow.value = true
  },
  delFriend = async () => {
    await ElMessageBox.confirm(
      `是否确认删除${ props.info.username }？`, '确认', {
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }
    )
    await store.dispatch('delFriend', props.info.id)
    isShow.value = false
    ElMessage.success('好友删除成功！')
  }

onMounted(() => {
  if (props.isFriend) {
    const f = props.info as Users.FriendOut
    settingUserForm.tags = f.tags
    settingUserForm.remark = f.remark || f.username
  }
})

defineExpose({ show })
</script>
<style lang="scss" scoped>
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
.basic-info {
  > div.info {
    display: flex;
    margin: 10px 0;
  }
}
</style>
