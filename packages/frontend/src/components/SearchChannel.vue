<template>
  <div class="search-channel">
    <el-page-header
      :icon="ArrowLeft"
      title="返回"
      content="发现频道"
      @back="$router.back()" />
    <el-input
      v-model="search.key"
      class="search-input"
      placeholder="请输入ID/频道名/关键字"
      :suffix-icon="Search"
      @keydown.enter="refresh"/>
    <el-empty v-if="channels.items.length === 0"
              description="暂无搜索结果"/>
    <div class="content">
      <channel-card v-for="channel in channels.items" :key="channel.id"
                    :channel="channel"/>
    </div>
    <el-pagination
      :page-size="search.num"
      :pager-count="search.page"
      layout="prev, pager, next"
      :total="channels.count"
      small
      @current-change="refresh"/>
  </div>
</template>

<script lang="ts" setup>
import { ElPageHeader, ElPagination, ElInput, ElEmpty } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { reactive, ref } from 'vue'
import { Channels, Pagination, SearchQuery } from '@boiling/core'
import { api } from '../api'
import ChannelCard from './ChannelCard.vue'

const
  search = reactive<SearchQuery>({
    page: 0,
    num: 10,
    key: ''
  }),
  channels = ref<Pagination<Channels.Model>>({ count: 0, items: [] })
const
  refresh = async function() {
  channels.value = await api.channels.query(search)
}
</script>

<style lang="scss" scoped>
.search-channel {
  padding: 20px;
  > .search-input {
    margin: 20px 0;
  }
  > div.content {
    display: flex;
    justify-content: start;
    flex-wrap: wrap;
    > .channel-card {
      margin: 10px;
    }
  }
}

</style>
