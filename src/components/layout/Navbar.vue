<script lang="ts" setup>
import RiHomeFill from "vue-remix-icons/ri-home-fill.vue";
import RiFolderUploadFill from "vue-remix-icons/ri-folder-upload-fill.vue";
import RiSearchFill from "vue-remix-icons/ri-search-fill.vue";
import RiSettingsFill from "vue-remix-icons/ri-settings-fill.vue";
import RiUserSmileFill from "vue-remix-icons/ri-user-smile-fill.vue";

const store = await useUserStore();

const links = [
  {
    label: "Home",
    to: "/",
    icon: RiHomeFill,
  },
  {
    label: "Upload",
    to: "/upload",
    icon: RiFolderUploadFill,
  },
  {
    label: "Search",
    to: "/search",
    icon: RiSearchFill,
  },
  {
    label: "Settings",
    to: "/settings",
    icon: RiSettingsFill,
  },
  {
    label: "Profile",
    to: `/@${store.username}`,
    icon: RiUserSmileFill,
  },
];

</script>
<template>
  <aside id="toolbar">
    <div v-for="link in links" :key="link.label">
      <NuxtLink :to="link.to" class="link">
        <UiTooltip :label="link.label" position="left">
          <component :is="link.icon" width="32" height="32" class="icon" />
        </UiTooltip>
      </NuxtLink>
    </div>
  </aside>
</template>
<style lang="stylus" scoped>
#toolbar
  position fixed

  display flex
  flex-direction column

  gap ss-xl-36

  padding-left ss-xl-24
  padding-right ss-xl-24

  padding-top ss-xxl-48
  padding-bottom ss-xxl-48

  @media screen and (max-width 950px)
    position relative
    overflow-x auto
    overflow-y visible

    padding-top ss-md-16
    padding-bottom ss-md-16

    border-top 1px solid cs-outline
    justify-content center
    flex-direction row

    width 100vw

  @media screen and (max-width 350px)
    justify-content start

.link
  fill cs-dimmed

  &.router-link-exact-active
    fill cs-primary

  .icon
    transition opacity 0.1s

    &:active
      transition opacity 0.1s
      opacity 0.5
</style>
