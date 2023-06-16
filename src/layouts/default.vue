<script lang="ts" setup>
/**
 * @see {@link https://cdn.domin.pro/8ZVV Scheme}
 * @see {@link https://github.com/pilcrowOnPaper/lucia/blob/main/examples/nuxt/pages/index.vue Example}
 */

const { data } = await useFetch("/api/user");

if (!data.value) throw createError("Failed to fetch data");

if (!data.value?.userId) {
  // if (!data.value.usersExist) await navigateTo("/register");
  // else await navigateTo("/login");
}
</script>
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
