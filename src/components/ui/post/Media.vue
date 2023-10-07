<script lang="ts" setup>
const { src } = defineProps<{
  src: string;
}>();
</script>
<template>
  <img :src="src" class="image" loading="lazy" decoding="async" />
</template>
<style lang="stylus" scoped>
.image
  width 100%
  background-color cs-outline

  border-radius rs-md-6
</style>
