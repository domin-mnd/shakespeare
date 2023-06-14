<template>
  <div id="wrapper">
    <slot />
  </div>
</template>
<style lang="stylus" scoped>
#wrapper
  display flex
  justify-content center
  background-color cs-background

  height 100vh

  @media screen and (max-width 950px)
    flex-direction column-reverse
</style>