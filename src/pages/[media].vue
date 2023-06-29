<script lang="ts" setup>
definePageMeta({
  layout: "client",
});

const route = useRoute();
const { data, error } = useFetch("/api/files", {
  params: {
    filename: route.params.media,
  },
  server: true,
});

if (error.value?.statusCode === 404) {
  throw createError({
    statusCode: 404,
    statusMessage: "File not found",
  });
}

useHead({
  meta: [
    { name: "twitter:image", content: route.fullPath + "/raw" },
    { name: "twitter:image:src", content: route.fullPath + "/raw" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "og:image", content: route.fullPath + "/raw" },
    { name: "og:type", content: "image" },
  ],
});
</script>
<template>
  <div>
    <UiPostMinified
      :avatar="data?.author.avatar_url"
      :nickname="data?.author.nickname"
      :username="(data?.author.username as string)"
      :date="(data?.created_at as string)"
      :src="route.fullPath + '/raw'"
      :views="data?.views as number"
    />
  </div>
</template>
