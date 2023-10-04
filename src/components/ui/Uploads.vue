<script lang="ts" setup>
const {
  username,
  quantity = 10,
  page: rawPage = 1,
  filename: rawFilename = () => "",
} = defineProps<{
  username?: string;
  quantity?: number;
  page?: number;
  filename?: () => string;
}>();

const cookie = useCookie("api_key");

if (!cookie.value) {
  await navigateTo("/login");
}

const filename = computed<string>(() => rawFilename());
let pageValue = rawPage;
const page = computed<number>(() => pageValue);

const { data, pending, error, refresh, execute, status } = await useFetch(
  "/api/search",
  {
    headers: {
      Authorization: cookie.value as string,
    },
    params: {
      quantity,
      page,
      username,
      filename,
    },
    server: false,
  }
);

if (error.value) throw createError(error.value);

let initiallyLoaded = false;

// Do not spam change loadMore value in the infinite scroll
// Via state
let loadMore: boolean = false;

let posts = ref(data.value ?? []);

watch(data, () => {
  if (!initiallyLoaded) {
    posts.value = data.value ?? [];
    initiallyLoaded = true;
  }
});
async function onScroll(event: Event) {
  const element = event.target as HTMLElement;

  // Ignore million onScroll calls when the value is already incremented
  if (
    Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) <
      400 &&
    !loadMore
  ) {
    loadMore = true;
    pageValue++;
    await refresh();
    loadMore = false;
    if (!data.value?.length) return;
    posts.value.push(...data.value);
    // posts.value = [...(posts.value ?? []), ...()];
  }
}

async function reset() {
  loadMore = true;
  posts.value = [];
  pageValue = 0;
  await refresh();
  posts.value = data.value ?? [];
  loadMore = false;
}

onMounted(() => {
  const layout = document.getElementById("__nuxt");
  // Add infinite scroll functionality
  layout?.addEventListener("scroll", onScroll);
});

watch(pending, () => {
  if (!data.value?.length && !pending.value && posts) {
    const layout = document.getElementById("__nuxt");
    // Remove infinite scroll functionality if there are no more posts
    layout?.removeEventListener("scroll", onScroll);
  }
});

watch(filename, () => {
  console.log(filename);
  reset();
});

defineExpose({ data, pending, error, refresh, execute });
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
  </div>
  <div v-if="pending && status === 'pending'">
    <slot name="pending">
      <span class="center">
        <UiLoader :loading="pending" />
      </span>
    </slot>
  </div>
  <div v-if="pending && status === 'idle'">
    <slot name="idle">
      <span class="center"> Nothing just yet... </span>
    </slot>
  </div>
  <div v-if="!data?.length && !pending && !(posts ?? []).length">
    <slot name="no-posts">
      <span class="center">
        No posts over here.{{ " " }}
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
  color cs-dimmed

  padding-top ss-xl-25
  padding-bottom ss-xl-25

  .link
    color cs-secondary
    text-decoration none

    &:hover
      text-decoration underline
      text-underline-offset 3px
      text-decoration-thickness 1px
</style>
