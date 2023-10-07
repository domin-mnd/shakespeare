<template>
  <main id="content">
    <slot />
  </main>
</template>
<style lang="stylus" scoped>
#content
  width 100%
  flex-grow 1
  max-width 600px

  border-left 1px solid cs-outline
  border-right 1px solid cs-outline

  color cs-secondary

  @media screen and (max-width 600px)
    border-left none
    border-right none
</style>
