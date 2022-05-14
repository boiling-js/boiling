<template>
  <div class="message">
    <img class="avatar"
         :alt="`@${modelValue.sender.username}`"
         :src="`/api/${modelValue.sender.avatar}`">
    <div class="content">
      <div class="title">
        <span class="uname">{{ modelValue.sender.username }}</span>
        <span class="ctime">{{ dayjs(modelValue.createdAt).format('YYYY-MM-DD') }}</span>
      </div>
      <div class="text" v-html="marked(modelValue.content)"/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import '../assets/nord.scss'
import { marked } from 'marked'
import hljs from 'highlight.js'
import dayjs from 'dayjs'
import { Messages } from '@boiling/core'

marked.setOptions({
  highlight(
    code: string, lang: string, _callback?: (error: any, code?: string) => void
  ): string | void {
    if (lang !== '') {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  },
  pedantic: false,
  gfm: true,
  breaks: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false
})

defineProps<{
  modelValue: Messages.Model
}>()
</script>

<style lang="scss" scoped>
div.message {
  display: flex;
  > img.avatar {
    margin-right: 15px;
    width: 45px;
    height: 45px;
    border-radius: 50%;
  }
  > div.content {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    justify-content: start;
    > div.title {
      display: flex;
      column-gap: 5px;
      align-items: end;
      color: #ccc;
      font-size: 14px;
      > span.ctime { font-size: 10px; }
    }
    > div.text {
      margin-top: 5px;
      color: #fff;
      font-size: 14px;
      white-space: pre-wrap;
      :deep(pre), :deep(p) {
        margin: 0;
      }
      :deep(pre) {
        padding: 10px;
        background-color: var(--color-auxi-regular);
        border: 1px solid var(--color-auxi-primary);
        border-radius: 5px;
      }
      :deep(img) {
        margin-top: 10px;
        max-width: 360px;
        &:not(:last-child) {
          margin-bottom: 10px;
        }
      }
    }
  }
}
</style>
