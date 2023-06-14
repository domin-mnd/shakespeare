<template>
  <main id="content">
    <slot />
  </main>
</template>
<style lang="stylus" scoped>
#content
  width 100%
  height 100%
  max-width 600px

  padding-left ss-xl-25
  padding-right ss-xl-25

  border-left 1px solid cs-outline
  border-right 1px solid cs-outline

  color cs-secondary

  @media screen and (max-width 950px)
    border-left none
    border-right none
</style>