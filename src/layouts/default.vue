<template>
  <LayoutWrapper>
    <div id="float">
      <LayoutNavbar />
    </div>
    <LayoutMain>
      <slot />
    </LayoutMain>
  </LayoutWrapper>
</template>
<style lang="stylus" scoped>
#float > *
  transform translateX(-100%)

  @media screen and (max-width 950px)
    transform unset
</style>
