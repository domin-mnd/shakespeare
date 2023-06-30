<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
<style lang="stylus">
// Import Manrope manually because @import fails to access src
// @import "@fontsource-variable/manrope/index.css"

@font-face
  font-family 'Manrope'
  font-style normal
  font-display swap
  font-weight 200 800
  src url(@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2) format('woff2-variations')
  unicode-range U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD

*
  font-family 'Manrope', sans-serif
  box-sizing border-box

body
  margin 0
  background-color cs-background


html
  overflow-y scroll

  scrollbar-width thin
  scrollbar-color cs-outline cs-background

  &::-webkit-scrollbar
    width 8px
  
  &::-webkit-scrollbar-thumb
    background-color cs-outline

  &::-webkit-scrollbar-track
    background-color cs-background

// Nuxt layout transitions
.layout-enter-active,
.layout-leave-active
  transition all 0.2s ease-in-out

.layout-enter-from,
.layout-leave-to
  opacity 0

// Nuxt page transitions
.page-enter-active,
.page-leave-active
  transition all 0.2s ease-in-out

.page-enter-from,
.page-leave-to
  opacity 0
</style>
