<template>
  <el-dialog
    v-model="isShow"
    title="好友设置"
    width="60%">
    <el-form ref="formRef" :model="settingUserForm" label-width="120px">
      <el-form-item label="备注：">
        <el-input v-model="settingUserForm.remark"/>
      </el-form-item>
      <el-form-item label="标签：">
        <el-select v-model="settingUserForm.tags" multiple placeholder="请选择标签">
          <el-option v-for="item in tags" :key="item"
                     :label="item" :value="item"/>
        </el-select>
        <el-input
          v-if="tagInputVisible"
          ref="tagInputRef"
          v-model="tagInputValue"
          class="ml-1 w-20"
          style="margin-left: 10px; width: 90px;"
          @keyup.enter="handleInputConfirm"
          @blur="tagInputVisible = false"/>
        <el-button
          v-else
          class="button-new-tag" style="margin-left: 10px; width: 90px;" @click="showInput">
          + 新标签
        </el-button>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="isShow = false">取消</el-button>
        <el-button
          v-if="!isFriend"
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
import { ElDialog, ElInput, ElForm, ElFormItem, ElSelect, ElOption, ElButton, ElMessageBox, ElMessage } from 'element-plus'
import { api } from '../api'

const
  store = useStore(),
  props = defineProps<{
    info: Users.Out | Users.FriendOut
  }>(),
  isShow = ref(false),
  isFriend = computed(() => store.state.user.friends.findIndex(
    (item: Users.Out['friends'][number]) => item.id === props.info.id
  ) !== -1),
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
  }

onMounted(() => {
  if (isFriend.value) {
    const f = props.info as Users.FriendOut
    settingUserForm.tags = f.tags
    settingUserForm.remark = f.remark || f.username
  }
})

defineExpose({ show })
</script>
