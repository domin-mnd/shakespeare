<script lang="ts" setup>
import { PhPencilSimple } from '@phosphor-icons/vue/compact';

const {
  avatarUrl,
  username,
  nickname,
  withEditButton
} = defineProps<{
  avatarUrl?: string | null;
  username: string;
  nickname?: string | null;
  withEditButton?: boolean;
}>();
</script>
<template>
  <header id="header">
    <UiAvatar
      :src="avatarUrl"
      :nickname="nickname || username"
      :size="150"
    />
    <div id="info">
      <div id="content">
        <span id="nickname">{{ nickname || username }}</span>
        <span v-if="nickname" id="username">{{ username }}</span>
      </div>
      <NuxtLink v-if="withEditButton" to="/settings/profile" id="edit-button">
        <PhPencilSimple :size="20" weight="fill" />
      </NuxtLink>
    </div>
  </header>
</template>
<style lang="stylus" scoped>
#header
  display flex
  flex-direction column
  align-items center
  justify-content center

  padding-top ss-xl-25
  padding-bottom ss-xl-25

  padding-left ss-xl-25
  padding-right ss-xl-25

  gap ss-lg-20
  border-bottom 1px solid cs-outline

#info
  position relative

  display flex
  align-items center
  justify-content center

  #edit-button
    position absolute
    right - ss-lg-20
    transform translateX(100%)

    transition color .3s ease
    color cs-dimmed
    cursor pointer
    height 20px

    &:hover
      transition color .3s ease
      color cs-primary

#content
  display flex
  align-items center
  justify-content center
  flex-direction column

  #nickname
    font-size fs-lg-20
    color cs-primary
  
  #username
    font-size fs-md-16
    color cs-secondary
</style>