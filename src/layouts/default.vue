<script lang="ts" setup>
/**
 * @see {@link https://cdn.domin.pro/8ZVV Scheme}
 * @see {@link https://github.com/pilcrowOnPaper/lucia/blob/main/examples/nuxt/pages/index.vue Example}
 */

const { data } = await useFetch("/api/profile");

if (!data.value) throw createError("Failed to fetch data");

if (!data.value?.userId) {
  if (!data.value.usersExist) await navigateTo("/register");
  else await navigateTo("/login");
}

const store = useUser();

// Converting to string because the above validation gets returned ^
store.value.userId = data.value.userId as string;
store.value.avatar_url = data.value.body.avatar_url;
store.value.nickname = data.value.body.nickname;
store.value.username = data.value.body.username;
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
