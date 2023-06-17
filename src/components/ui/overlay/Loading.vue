<script lang="ts" setup>
const { show, state } = defineProps(["show", "state"]);
</script>
<template>
  <UiOverlay :show="show">
    <UiLoader :loading="show" />
    <span id="loading-state">
      {{ state }}
    </span>
  </UiOverlay>
</template>
<style lang="stylus" scoped>
#loading-state
  margin-top ss-lg-20
  color cs-dimmed
  font-size fs-md-15
  user-select none
</style>
