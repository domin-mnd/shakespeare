<script lang="ts" setup>
definePageMeta({
  layout: "client",
});

const route = useRoute();
const { data, error } = await useFetch("/api/files", {
  params: {
    filename: route.params.media,
  },
  server: true,
});

if (error.value?.statusCode !== 404) {
  useHead({
    meta: [
      { name: "og:image", content: route.fullPath + "/raw" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  });
}
</script>
<template>
  <div v-if="(error?.statusCode !== 404)">
    <UiPostOuter
      :avatar="data?.author.avatar_url"
      :nickname="data?.author.nickname"
      :username="(data?.author.username as string)"
      :date="(data?.created_at as string)"
      :src="route.fullPath + '/raw'"
      :views="(data?.views as number)"
    />
  </div>
  <div id="text-center" v-else>
    <span>We could not find anything matching your search 🍃</span>
  </div>
</template>
<style lang="stylus" scoped>
#text-center
  text-align center
</style>
