<template>
  <form v-bind="$attrs" class="form">
    <slot />
  </form>
</template>
<style lang="stylus" scoped>
.form
  display flex
  flex-direction column

  gap ss-xl-35
  width 100%
</style>