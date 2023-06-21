<script lang="ts" setup>
const { show, opacity } = defineProps<{
  show: boolean;
  opacity?: number;
}>();
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
.overlay
  transition all .3s ease
  display flex
  flex-direction column
  justify-content center
  align-items center
  opacity 0
  pointer-events none

  position fixed
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
