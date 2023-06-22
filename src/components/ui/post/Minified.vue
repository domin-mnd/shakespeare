<script lang="ts" setup>
const { avatar, nickname, username, date, views, src } = defineProps<{
  avatar?: string | null;
  nickname?: string | null;
  username: string;
  date: string;
  views: number;
  src: string;
}>();

const postDate = new Date(date);
const minutes =
  postDate.getMinutes().toString().length === 1
    ? `0${postDate.getMinutes()}`
    : postDate.getMinutes();
const hours = postDate.getHours();
const day = postDate.getDate();
const month = postDate.toLocaleString("default", { month: "short" });
const year = postDate.getFullYear();
</script>
<template>
  <div class="post">
    <div id="author">
      <UiAvatar :src="avatar" :nickname="nickname || username" :size="48" />
      <div id="user">
        <span id="nickname">{{ nickname || username }}</span>
        <span v-if="nickname" id="username">@{{ username }}</span>
      </div>
    </div>
    <img :src="src" id="image" />
    <div id="info">
      <span id="timestamp">
        {{ new Date().getFullYear() !== year ? year + ", " : undefined }}{{ month }} {{ day }}, {{ hours }}:{{ minutes }}
      </span>
      <div id="views">
        <span id="count">
          {{ views }}
        </span>
        <span id="label">
          {{ views === 1 ? 'View' : 'Views' }}
        </span>
      </div>
    </div>
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

  #author
    display flex
    align-items center
    gap ss-md-12

    #user
      display flex
      flex-direction column
      justify-content center

      #nickname
        font-size fs-md-16
        color cs-primary

      #username
        font-size fs-md-14
        color cs-secondary
        user-select none

  #image
    width 100%

    border-radius rs-md-6

  #info
    display flex
    justify-content space-between

    padding-left ss-sm-10
    padding-right ss-sm-10

    #timestamp
      font-size fs-md-15
      color cs-secondary
      user-select none
    
    #views
      display flex
      gap ss-xs-3

      #count
        font-size fs-md-16
        color cs-primary
      
      #label
        font-size fs-md-16
        color cs-secondary
        user-select none
</style>
