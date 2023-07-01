<script lang="ts" setup>
const {
  src
} = defineProps<{
  src: string
}>();
</script>
<template>
  <img :src="src" class="image" loading="lazy" />
</template>
<style lang="stylus" scoped>
.image
  width 100%

  border-radius rs-md-6
</style>