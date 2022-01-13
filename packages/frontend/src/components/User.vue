<template>
  <div class="user" :class="[ type ]">
    <div class="bg"/>
    <div class="avatar" :style="{
      backgroundImage: `url(/api${info.avatar})`
    }"/>
    <div class="info">
      {{ info.remark || info.username }}<span class="id">#{{ info.id }}</span>
    </div>
    <div class="operates">
      <span v-if="!isFriend"
            class="material-icons"
            @click="settingUserDialog = true">add</span>
      <span v-if="isFriend"
            class="material-icons"
            @click="$emit('chat')">chat_bubble_outline</span>
      <span v-if="isFriend"
            class="material-icons"
            @click="settingUserDialog = true">settings</span>
    </div>
    <el-dialog
      v-model="settingUserDialog"
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
          <el-button @click="settingUserDialog = false">取消</el-button>
          <el-button
            v-if="!isFriend"
            type="primary" @click="add">下一步</el-button>
          <el-button
            v-else
            type="primary" @click="settingFriend">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { Users } from '@boiling/core'
import { ElDialog, ElInput, ElForm, ElFormItem, ElSelect, ElOption, ElButton, ElMessageBox, ElMessage } from 'element-plus'
import { api } from '../api'
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useStore } from 'vuex'

defineEmits(['chat'])
const
  store = useStore(),
  props = withDefaults(defineProps<{
    info: Users.Out | Users.FriendOut
    type?: 'inline' | 'popup'
  }>(), {
    type: 'inline'
  }),
  tags = computed(() => store.state.user.tags),
  settingUserDialog = ref(false),
  settingUserForm = reactive<Omit<Users.Friend, 'id'>>({
    tags: [],
    remark: ''
  }),
  isFriend = ref(false),
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
      await api.user('@me').friend(props.info.id).add({
        tags: settingUserForm.tags,
        remark: settingUserForm.remark
      })
      ElMessage.success('请求发送成功！')
    } catch {}
  },
  settingFriend = async () => {
    await api.user('@me').friend(props.info.id).update({
      tags: settingUserForm.tags,
      remark: settingUserForm.remark
    })
    ElMessage.success('好友设置成功！')
  }
onMounted(() => {
  isFriend.value = store.state.user.friends.findIndex(
    (item: Users.Out['friends'][number]) => item.id === props.info.id
  ) !== -1
})
</script>

<style lang="scss" scoped>
div.user {
  --bg-color: var(--color-auxi-regular);

  position: relative;
  display: flex;
  width: calc(100% - 20px);
  overflow: hidden;
  color: var(--color-text-regular);
  background-color: var(--bg-color);
  > div.bg {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: 60px;
    background-color: #fff;
    border-radius: 6px 6px 0 0;
  }
  > div.avatar {
    z-index: 10;
    margin-right: 10px;
    width: var(--size);
    height: var(--size);
    background-size: cover;
    border-radius: 50%;
  }
  > div.info {
    display: flex;
    align-items: center;
    font-size: 20px;
    font-weight: bold;
    > span.id {
      color: var(--color-text-secondary);
    }
  }
  > div.operates > span.material-icons {
    padding: 4px;
    margin: 0 5px;
    cursor: pointer;
    background-color: var(--bg-color);
    border-radius: 6px;
    opacity: 0.5;
    transition: 0.3s;
    &:hover {
      opacity: 1;
    }
  }
  &.inline {
    justify-content: space-between;
    padding: 10px;
    > div.bg {
      display: none;
    }
    > div.avatar {
      --size: 48px;
    }
    > div.info {
      flex-grow: 1;
      font-size: 16px;
      > span.id {
        color: var(--color-text-secondary);
        opacity: 0;
        transition: 0.3s;
      }
    }
    > div.operates {
      display: flex;
      align-items: center;
    }
    &:hover {
      > div.info > span.id {
        opacity: 1;
      }
    }
  }
  &.popup {
    flex-direction: column;
    justify-content: space-around;
    padding: 30px 10px 10px;
    height: 100px;
    border-radius: 6px;
    > div.avatar {
      --size: 64px;

      border: 6px solid var(--bg-color);
    }
    > div.operates {
      position: absolute;
      top: 10px;
      right: 10px;
    }
  }
}
</style>
