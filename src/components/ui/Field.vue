<script lang="ts" setup>
const { fieldName, label, note } = defineProps<{
  fieldName: string;
  label: string;
  note?: string;
}>();
</script>
<template>
  <div class="field">
    <UiLabel :for="fieldName" :label="label" :note="note" />
    <UiInput :field-name="fieldName" v-bind="$attrs" />
  </div>
</template>
<style lang="stylus" scoped>
.field
  width 100%
  max-width 600px

  display flex
  gap ss-sm-10
  flex-direction column
</style>
