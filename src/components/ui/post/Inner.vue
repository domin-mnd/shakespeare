<script lang="ts" setup>
const { avatar, nickname, username, date, views, src } = defineProps<{
  avatar?: string | null;
  nickname?: string | null;
  username: string;
  date: string;
  views: number;
  src: string;
  href: string;
}>();
</script>
<template>
  <NuxtLink :to="href" class="post">
    <div class="nest">
      <NuxtLink :to="'/@' + username" class="user-link">
        <UiAvatar :src="avatar" :nickname="nickname || username" :size="48" />
      </NuxtLink>
    </div>
    <div class="content">
      <div class="author">
        <NuxtLink :to="'/@' + username" class="nickname">{{
          nickname || username
        }}</NuxtLink>
        <span v-if="nickname" class="username">@{{ username }}</span>
      </div>
      <UiPostMedia :src="src" />
      <UiPostInfo :date="date" :views="views" />
    </div>
  </NuxtLink>
</template>
<style lang="stylus" scoped>
.post
  transition background-color .3s ease
  display flex
  gap ss-md-12

  padding-left ss-xl-25
  padding-right ss-xl-25
  padding-top ss-lg-20
  padding-bottom ss-lg-20

  text-decoration none

  &:hover
    background-color cs-hover-background
    transition background-color .3s ease

  &:active
    background-color cs-active-background
    transition background-color .3s ease

  .nest
    height 100%

    padding-top ss-xs-5
    padding-bottom ss-xs-5

    .user-link
      text-decoration none

  .content
    display flex
    flex-direction column
    flex-grow 1

    padding-top ss-sm-7
    gap ss-md-15

    .author
      display flex
      align-items center
      gap ss-xs-5

      padding-left ss-xxs-2
      padding-right ss-xxs-2

      .nickname
        font-size fs-md-16
        color cs-primary

        text-decoration none

        &:hover
          text-decoration underline
          text-underline-offset 3px
          text-decoration-thickness 1px


      .username
        font-size fs-md-14
        color cs-secondary
        user-select none
</style>
