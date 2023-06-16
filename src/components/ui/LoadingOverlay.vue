<script lang="ts" setup>
const {
  loading
} = defineProps(['loading']);
</script>
<template>
  <div v-show="loading" class="overlay">
    <UiLoader :loading="loading" />
  </div>
</template>
<style lang="stylus" scoped>
.overlay
  display flex
  justify-content center
  align-items center

  background-color rgba(0, 0, 0, 0.65)

  position absolute
  top 0
  left 0
  z-index 25
  width 100vw
  height 100vh
</style>