<template>
  <div id="wrapper">
    <aside id="toolbar">// icons in the toolbar</aside>
    <main id="content">
      <slot />
    </main>
  </div>
</template>
<style lang="stylus" scoped>
  #wrapper
    display flex
    justify-content center
    background-color background
</style>
