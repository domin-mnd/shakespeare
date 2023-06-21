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
  })
}
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
