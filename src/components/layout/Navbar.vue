<script lang="ts" setup>
import Avatar from "@/components/ui/Avatar.vue";
import {
  PhHouse,
  PhPaperPlaneTilt,
  PhMagnifyingGlass,
  PhNut,
} from "@phosphor-icons/vue/compact";

const store = useUser();

const links = [
  {
    label: "Home",
    to: "/",
    icon: PhHouse,
  },
  {
    label: "Upload",
    to: "/upload",
    icon: PhPaperPlaneTilt,
  },
  {
    label: "Search",
    to: "/search",
    icon: PhMagnifyingGlass,
  },
  {
    label: "Settings",
    to: "/settings",
    icon: PhNut,
  },
  {
    label: "Profile",
    to: `/@${store.value.username}`,
    icon: Avatar,
    params: {
      src: store.value.avatar_url,
      nickname: store.value.nickname || store.value.username,
    },
  },
];
</script>
<template>
  <aside id="toolbar">
    <div v-for="link in links" :key="link.label">
      <NuxtLink :to="link.to" class="link">
        <UiTooltip :label="link.label" position="left">
          <component
            :is="link.icon"
            :size="28"
            class="icon"
            weight="fill"
            v-bind="link.params"
          />
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

  gap ss-xl-35

  padding-left ss-xl-24
  padding-right ss-xl-24

  padding-top ss-xxl-48
  padding-bottom ss-xxl-48

  @media screen and (max-width 950px)
    overflow-x auto
    overflow-y visible

    padding-top ss-md-16
    padding-bottom ss-md-16

    border-top 1px solid cs-outline
    background-color rgba(cs-background, .8)
    z-index 10
    justify-content center
    flex-direction row

    width 100vw

  @media screen and (max-width 950px)
    backdrop-filter blur(10px)

  @media screen and (max-width 600px)
    justify-content space-around

  @media screen and (max-width 350px)
    justify-content start

.link
  color cs-dimmed
  text-decoration none

  &.router-link-exact-active
    color cs-primary

  .icon
    transition opacity 0.1s

    &:active
      transition opacity 0.1s
      opacity 0.5
</style>
