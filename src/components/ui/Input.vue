<script lang="ts" setup>
const { type, placeholder, fieldName } = defineProps<{
  type?: string;
  placeholder?: string;
  fieldName?: string;
}>();

function onFileChange(event: Event) {
  // Get file location
  const files = (event.target as HTMLInputElement).files;
  if (!files) return;

  const input = document.querySelector(
    ".file-wrapper .text"
  ) as HTMLInputElement;
  if (!input) return;

  input.value = files[0].name;
}

function onInputChange() {
  const files = document.querySelector(
    ".file.input input[type=file]"
  ) as HTMLInputElement;
  if (!files) return;

  // Remove file from input
  files.value = "";
}

const input = ref(null);
defineExpose({
  input,
});
</script>
<template>
  <div v-if="type === 'file'" class="file-wrapper">
    <input
      type="text"
      class="text input splice"
      :name="fieldName + 'Url'"
      :placeholder="placeholder"
      @input="onInputChange"
    />
    <label class="file input">
      <input
        type="file"
        :name="fieldName"
        @change="onFileChange"
        ref="input"
        v-bind="$attrs"
      />
      Select File
    </label>
  </div>
  <input
    v-else
    :type="type"
    :placeholder="placeholder"
    :name="fieldName"
    class="text input"
    ref="input"
    v-bind="$attrs"
  />
</template>
<style lang="stylus" scoped>
.file-wrapper
  display flex

  .file
    border 1px solid cs-outline
    border-radius 0 rs-md-6 rs-md-6 0

    background-color cs-outline
    cursor pointer
    white-space nowrap

    transition border .2s ease

    input[type="file"]
      display none

    &:hover
      border 1px solid cs-dimmed

      transition border .2s ease

  .text
    min-width 0
    flex-grow 1
    border-top-right-radius 0
    border-bottom-right-radius 0

.text
  background-color transparent
  border 1px solid cs-outline
  border-radius rs-md-6

  font-size fs-md-16
  color cs-primary
  outline none

  transition border .2s ease

  &::placeholder
    color cs-dimmed

  &:focus
    border 1px solid cs-dimmed

    transition border .2s ease

.input
  appearance none

  padding-top ss-sm-10
  padding-bottom ss-sm-10

  padding-left ss-md-15
  padding-right ss-md-15
</style>
