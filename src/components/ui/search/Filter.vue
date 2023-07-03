<script lang="ts" setup>
const { show, title } = defineProps<{
  show: boolean;
  title: string;
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
  <UiModal :title="title" @close="$emit('close')" class="visibility" :class="{ show }" without-close-button>
    <slot />
  </UiModal>
</template>
<style lang="stylus" scoped>
.visibility
  transition all .3s ease
  opacity 0
  pointer-events none

  &.show
    transition all .3s ease
    opacity 1
    pointer-events auto
</style>
