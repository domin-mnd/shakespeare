<script lang="ts" setup>
const { variant } = defineProps<{
  variant?: "primary" | "secondary";
}>();
</script>
<template>
  <button class="button" :class="variant ?? 'primary'">
    <slot />
  </button>
</template>
<style lang="stylus" scoped>
.button
  border-radius rs-sm-4
  outline none
  border none

  transition all .3s ease

  font-size fs-md-16
  cursor pointer

  padding-left ss-lg-20
  padding-right ss-lg-20

  padding-top ss-sm-10
  padding-bottom ss-sm-10

  &:hover
    transition all .3s ease

  &:active
    transition all .3s ease

  &.primary
    background-color cs-secondary
    color cs-outline
    fill cs-outline

    &:hover
      background-color cs-primary

    &:active
      opacity .5

  &.secondary
    background-color transparent
    border 1px solid cs-dimmed
    color cs-dimmed
    fill cs-dimmed

    &:hover
      border 1px solid cs-secondary
      color cs-secondary
      fill cs-secondary

    &:active
      opacity .5
</style>
