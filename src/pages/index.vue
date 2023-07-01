<script lang="ts" setup>
useHead({
  title: "Shakespeare",
});

onMounted(() => {
  // When visiting profile scroll to top
  const layout = document.getElementById("__nuxt");
  layout?.scrollTo(0, 0);
});
</script>
<template>
  <UiUploads />
</template>
