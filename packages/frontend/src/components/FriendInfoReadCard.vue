<!--
    @desc:   好友详情读取
    @author: liuguanghui
    @date:   2022-01-04
-->
<template>
  <div class="friend-info-card">
    <div class="avatar">

    </div>
    <div class="info">
      详情
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
.friend-info-card {
  display: flex;
  padding: 10px;
  width: 100%;
  height: 50px;
  > div.avatar {
    margin-right: 10px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
  }
  > div.info {
    flex-grow: 1;
  }
}
</style>
