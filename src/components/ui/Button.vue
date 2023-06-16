<template>
  <button class="button" v-bind="$attrs">
    <slot />
  </button>
</template>
<style lang="stylus" scoped>
.button
  border-radius rs-sm-4
  border 1px solid cs-secondary
  outline none
  background-color cs-secondary

  transition all .3s ease

  color cs-outline
  font-size fs-md-16
  cursor pointer

  padding-left ss-lg-20
  padding-right ss-lg-20

  padding-top ss-sm-10
  padding-bottom ss-sm-10

  &:hover
    transition all .3s ease
    border 1px solid cs-secondary
    background-color cs-primary
  
  &:focus
    transition all .3s ease
    border 1px solid cs-secondary
    background-color cs-background
    color cs-secondary

</style>
