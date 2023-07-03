<script lang="ts" setup>
const { show, title, content } = defineProps<{
  show: boolean;
  title: string;
  content: string;
}>();

const emit = defineEmits<{
  (event: "close"): void;
}>();

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") emit("close");
}

onMounted(() => {
  window.onkeydown = onKeydown;
});
</script>
<template>
  <UiOverlay :show="show" :opacity="0.5">
    <UiModal :title="title" @close="$emit('close')">
      {{ content }}
    </UiModal>
  </UiOverlay>
</template>
