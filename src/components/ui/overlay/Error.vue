<script lang="ts" setup>
const { show, title, content } = defineProps(["show", "title", "content"]);
</script>
<template>
  <UiOverlay :show="show" opacity="0.5">
    <UiModal :title="title" @close="$emit('close')">
      {{ content }}
    </UiModal>
  </UiOverlay>
</template>
