<script lang="ts" setup>
const cookie = useCookie("api_key");

if (!cookie.value) {
  throw createError({
    statusCode: 401,
    statusMessage: "Unauthorized",
  });
}

const page = ref<number>(1);

const { data, error } = await useFetch("/api/search", {
  headers: {
    Authorization: cookie.value,
  },
  params: {
    quantity: 10,
    page,
  }
});

if (error.value)
  throw createError({
    statusCode: error.value.statusCode,
    statusMessage: error.value.statusMessage,
  });

function onScroll(event: Event) {
  // console.log(event.target.);
}

onMounted(() => {  
  document.onscroll = onScroll;
});

</script>
<template>
  <div class="posts" v-if="data?.length">
    <div v-for="post in data" :key="post.id">
      <UiPostNested
        :avatar="post.author.avatar_url"
        :nickname="post.author.nickname"
        :username="post.author.username"
        :date="post.created_at"
        :views="post.views"
        :src="'/' + post.filename + '/raw'"
        :href="'/' + post.filename"
      />
    </div>
  </div>
  <div class="not-found" v-else>
    <span>
      No posts over here. <NuxtLink to="/upload" class="link">Make one</NuxtLink>! 🌎
    </span>
  </div>
</template>
<style lang="stylus" scoped>
.posts > div
  border-bottom 1px solid cs-outline

.not-found
  display flex
  justify-content center
  align-items center
  padding ss-xl-25
  height 100%

  .link
    color cs-primary
    text-decoration none

    &:hover
      text-decoration underline
      text-underline-offset 3px
      text-decoration-thickness 1px
</style>
