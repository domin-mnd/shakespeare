<script lang="ts" setup>
const cookie = useCookie("api_key");

if (!cookie.value) {
  throw createError({
    statusCode: 401,
    statusMessage: "Unauthorized",
  });
}

const page = ref<number>(1);

const { data, error, refresh, pending } = await useFetch("/api/search", {
  headers: {
    Authorization: cookie.value,
  },
  params: {
    quantity: 10,
    page,
  },
  server: false,
});

if (error.value) throw createError(error.value);

// Do not spam change loadMore value in the infinite scroll
// Via state
let loadMore: boolean = false;

async function onScroll(event: Event) {
  const element = event.target as HTMLElement;

  // Ignore million onScroll calls when the value is already incremented
  if (
    Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) <
      400 &&
    !loadMore
  ) {
    loadMore = true;
    page.value++;
    await refresh();
    loadMore = false;
    posts = [...(posts ?? []), ...(data.value ?? [])];
  }
}

onMounted(() => {
  const layout = document.getElementById("__nuxt");
  // Add infinite scroll functionality
  layout?.addEventListener("scroll", onScroll);
});

let posts = data.value;

watch(pending, () => {
  if (!data.value?.length && !pending.value && posts) {
    const layout = document.getElementById("__nuxt");
    // Remove infinite scroll functionality if there are no more posts
    layout?.removeEventListener("scroll", onScroll);
  }
});
</script>
<template>
  <div>
    <div class="posts">
      <div v-for="post in posts" :key="post.id">
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
      <span class="center" v-show="pending">
        <UiLoader :loading="pending" />
      </span>
    </div>
    <div class="center" v-if="!data?.length && !pending && !posts">
      <span>
        No posts over here.
        <NuxtLink to="/upload" class="link">Make one</NuxtLink>! 🌎
      </span>
    </div>
    <div class="center" v-if="!data?.length && !pending && posts">
      <span> You've managed to scroll to the end! 🛑 </span>
    </div>
  </div>
</template>
<style lang="stylus" scoped>
.posts > div
  border-bottom 1px solid cs-outline

.center
  display flex
  justify-content center
  align-items center

  padding-top ss-xl-25
  padding-bottom ss-xl-25

  .link
    color cs-primary
    text-decoration none

    &:hover
      text-decoration underline
      text-underline-offset 3px
      text-decoration-thickness 1px
</style>
