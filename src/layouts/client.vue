<script setup lang="ts">
useHead({
  meta: [
    // Do not expose client-side media
    { name: "robots", content: "noindex,nofollow" },
  ],
});
</script>
<template>
  <LayoutWrapper>
    <LayoutMain class="center">
      <slot />
    </LayoutMain>
  </LayoutWrapper>
</template>
<style lang="stylus" scoped>
.center
  display flex
  justify-content center
  align-items center
</style>
