<script lang="ts" setup>
import RiCloseFill from 'vue-remix-icons/ri-close-fill.vue';

const {
  title,
  withoutCloseButton,
} = defineProps<{
  title?: string;
  withoutCloseButton?: boolean;
}>();
</script>
<template>
  <div class="box">
    <div v-if="title || !withoutCloseButton" class="header">
      <span class="title">{{ title ?? "" }}</span>
      <RiCloseFill v-if="!withoutCloseButton" width="24" height="24" class="close" @click="$emit('close')" />
      <div v-else />
    </div>
    <div class="content">
      <slot />
    </div>
  </div>
</template>
<style lang="stylus" scoped>
.box
  display flex
  flex-direction column
  max-width 400px
  width 100%
  margin 0 ss-md-16

  border-radius rs-lg-10
  background-color cs-background
  box-shadow rgba(0, 0, 0, 0.2) 0 8px 16px 0
  border 1px solid cs-outline

  padding ss-sm-10

.header
  display flex
  justify-content space-between
  align-items center

  padding ss-sm-10

  .title
    font-size fs-md-16
    color cs-primary

  .close
    transition fill .3s ease
    cursor pointer
    fill cs-dimmed

    &:hover
      transition fill .3s ease
      fill cs-primary

.content
  padding ss-sm-10
  font-size fs-md-15

</style>