<script lang="ts" setup>
const { show, opacity } = defineProps(["show", "opacity"]);
</script>
<template>
  <div
    :class="{ show }"
    :style="{ backgroundColor: `rgba(0, 0, 0, ${opacity ?? 0.65})` }"
    class="overlay"
  >
    <slot />
  </div>
</template>
<style lang="stylus" scoped>
// @keyframes hide
//   0%
//     opacity 1
//     height 100vh
//   99.9%
//     opacity 0
//     height 100vh
//   100%
//     opacity 0
//     height 0

// @keyframes show
//   0%
//     opacity 0
//   0.1%
//     opacity 0
//     height 100vh
//   100%
//     opacity 1

.overlay
  transition all .3s ease
  display flex
  flex-direction column
  justify-content center
  align-items center
  opacity 0
  pointer-events none

  position absolute
  top 0
  left 0
  z-index 25
  width 100vw
  height 100vh

  &.show
    transition all .3s ease
    opacity 1
    pointer-events auto
</style>
