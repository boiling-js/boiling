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
        @click="$refs.createGroup.open"
      >add</span>
    </div>
  </div>
  <create-group ref="createGroup"/>
</template>

<script lang="ts" setup>
import { ElInput } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import CreateGroup from '../../components/CreateGroup.vue'

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
