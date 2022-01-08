<template>
  <svg class="boiling" viewBox="0 0 1024 1024" :width="size" :height="size">
    <path fill="#FFFFFF" class="bg"
          d="M832 320h-96V288h96V192h-60.16l42.56-42.56-67.84-67.84L704 124.16V64h-96v96H192a96 96 0 0 0-96 96v516.48l38.72-32A305.92 305.92 0 0 0 400 896a302.08 302.08 0 0 0 247.68-128h83.2L928 932.48V416a96 96 0 0 0-96-96z"/>
    <path fill="#E9EAEB" class="bottom"
          d="M400 592m-272 0a272 272 0 1 0 544 0 272 272 0 1 0-544 0Z"/>

    <path fill="#fab0d2" class="r-bg"
          d="M896 416a64 64 0 0 0-64-64H384a64 64 0 0 0-64 64v256a64 64 0 0 0 64 64h358.4l153.6 128v-192z"/>
    <path fill="#2A5082" class="r-border"
          d="M832 352h-96v32h96a32 32 0 0 1 32 32v379.52l-101.12-84.16-8.96-7.36H384a32 32 0 0 1-32-32v-64h-32v64a64 64 0 0 0 64 64h358.4l153.6 128V416a64 64 0 0 0-64-64z"/>
    <g>
      <path fill="#2A5082" class="r-content"
            d="M768 512h32v32h-32zM416 608h224v32h-224zM704 608h96v32h-96z"/>
      <animate v-bind="flashingAnim(4, flashing)"
               attributeName="opacity"
               fill="freeze" calcMode="linear"
               repeatCount="indefinite"/>
    </g>

    <path fill="#A3D4FF" class="l-bg"
          d="M128 256a64 64 0 0 1 64-64h448a64 64 0 0 1 64 64v256a64 64 0 0 1-64 64H281.6L128 704v-192z"/>
    <path fill="#2A5082" class="l-border"
          d="M281.6 576H640a64 64 0 0 0 64-64V256a64 64 0 0 0-64-64H192a64 64 0 0 0-64 64v448zM160 256a32 32 0 0 1 32-32h448a32 32 0 0 1 32 32v256a32 32 0 0 1-32 32H270.08l-8.96 7.36L160 635.52V256z"/>
    <g>
      <path fill="#2A5082" class="l-content"
            d="M224 288h384v32H224zM384 384h224v32h-224zM224 384h96v32H224z"/>
      <animate v-bind="flashingAnim(2, flashing)"
               attributeName="opacity"
               fill="freeze" calcMode="linear"
               repeatCount="indefinite"/>
    </g>

    <g>
      <path fill="#2A5082" class="l-boil"
            d="M736 224h64v32h-64zM701.376 172.416l45.28-45.248 22.624 22.624-45.28 45.248zM640 96h32v64h-32z"/>
      <animate v-bind="flashingAnim(1, flashing)"
               attributeName="opacity"
               fill="freeze" calcMode="linear"
               repeatCount="indefinite"/>
    </g>
    <g>
      <path fill="#2A5082" class="r-boil"
            d="M224 672h64v32H224zM254.848 778.176l45.248-45.248 22.624 22.624-45.248 45.248zM352 768h32v64h-32z"/>
      <animate v-bind="flashingAnim(3, flashing)"
               attributeName="opacity"
               fill="freeze" calcMode="linear"
               repeatCount="indefinite"/>
    </g>
  </svg>
</template>

<script lang="ts" setup>
const props = withDefaults(defineProps<{
  size?: number
  animTime?: number
}>(), {
  size: 128,
  animTime: 4
})
const flashing = [0, 1, 0, 1, 0, 1]
function flashingAnim(time: number, arr: number[]) {
  return {
    dur: `${props.animTime}s`,
    values: new Array(arr.length * time)
      .fill(0)
      .concat(arr).concat(new Array(arr.length * (4 - time)).fill(1))
      .join(';')
  }
}
</script>

<style lang="scss" scoped>
svg.boiling {
}
</style>
