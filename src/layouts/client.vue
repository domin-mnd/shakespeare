<script setup lang="ts">
useHead({
  meta: [
    // Do not expose client-side media
    { name: "robots", content: "noindex,nofollow" },
  ],
});
</script>
<template>
  <LayoutWrapper class="direction">
    <LayoutMain class="center">
      <slot />
    </LayoutMain>
  </LayoutWrapper>
</template>
<style lang="stylus" scoped>
.direction
  flex-direction column
.center
  display flex
  margin auto
  padding ss-xl-24 0
  justify-content center
  flex-direction column
</style>
