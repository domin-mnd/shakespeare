<script lang="ts" setup>
const { avatar, nickname, username, date, views, src } = defineProps<{
  avatar?: string | null;
  nickname?: string | null;
  username: string;
  date: string;
  views: number;
  src: string;
}>();
</script>
<template>
  <div class="post">
    <div class="author">
      <UiAvatar :src="avatar" :nickname="nickname || username" :size="48" />
      <div class="user">
        <span class="nickname">{{ nickname || username }}</span>
        <span v-if="nickname" class="username">@{{ username }}</span>
      </div>
    </div>
    <UiPostMedia :src="src" />
    <UiPostInfo
      :date="date"
      :views="views"
    />
  </div>
</template>
<style lang="stylus" scoped>
.post
  display flex
  flex-direction column
  gap ss-md-15

  padding-left ss-xl-25
  padding-right ss-xl-25
  padding-top ss-lg-20
  padding-bottom ss-lg-20

  .author
    display flex
    align-items center
    gap ss-md-12

    .user
      display flex
      flex-direction column
      justify-content center

      .nickname
        font-size fs-md-16
        color cs-primary

      .username
        font-size fs-md-14
        color cs-secondary
</style>
