<script lang="ts" setup>
const { label, note } = defineProps<{
  label: string;
  note?: string;
}>();
</script>
<template>
  <div class="label">
    <label>{{ label }}</label>
    <span v-if="note" class="note">·</span>
    <span v-if="note" class="note">{{ note }}</span>
  </div>
</template>
<style lang="stylus" scoped>
.label
  display flex
  gap ss-xs-5
  color cs-primary
  font-size fs-md-16

  .note
    color cs-secondary
</style>
