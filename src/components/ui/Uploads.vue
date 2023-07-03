<script lang="ts" setup>
const {
  username,
  quantity = 10,
  page = ref<number>(1),
} = defineProps<{
  username?: string;
  quantity?: number;
  page?: Ref<number>;
}>();

const cookie = useCookie("api_key");

if (!cookie.value) {
  await navigateTo("/login");
}

const { data, pending, error, refresh } = await useFetch("/api/search", {
  headers: {
    Authorization: cookie.value as string,
  },
  params: {
    quantity,
    page,
    username,
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
    posts.value = [...(posts.value ?? []), ...(data.value ?? [])];
  }
}

onMounted(() => {
  const layout = document.getElementById("__nuxt");
  // Add infinite scroll functionality
  layout?.addEventListener("scroll", onScroll);
});

let posts = ref(data.value);

watch(pending, () => {
  if (!data.value?.length && !pending.value && posts) {
    const layout = document.getElementById("__nuxt");
    // Remove infinite scroll functionality if there are no more posts
    layout?.removeEventListener("scroll", onScroll);
  }
});
</script>
<template>
  <div class="posts" v-bind="$attrs">
    <slot name="posts" :posts="posts">
      <div v-for="post in posts" :key="post.id">
        <UiPostInner
          :avatar="post.author.avatar_url"
          :nickname="post.author.nickname"
          :username="post.author.username"
          :date="post.created_at"
          :views="post.views"
          :src="'/' + post.filename + '/raw'"
          :href="'/' + post.filename"
        />
      </div>
    </slot>
    <span class="center" v-show="pending">
      <UiLoader :loading="pending" />
    </span>
  </div>
  <div class="center" v-if="!data?.length && !pending && !(posts ?? []).length">
    <slot name="no-posts">
      <span>
        No posts over here.
        <NuxtLink to="/upload" class="link">Make one</NuxtLink>! 🌎
      </span>
    </slot>
  </div>
  <div class="center" v-if="!data?.length && !pending && (posts ?? []).length">
    <slot name="no-posts-left">
      <span>No more posts over here...</span>
    </slot>
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
