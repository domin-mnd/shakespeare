<script lang="ts" setup>
import { PhFunnel } from "@phosphor-icons/vue/compact";

const filterModalOpened = ref<boolean>(false);

const inputElement = ref<{ input: HTMLInputElement } | null>(null);
const inputValue = ref<string>("");

function onInputChange(event: Event) {
  const input = event.target as HTMLInputElement;

  inputValue.value = input.value;
}

defineExpose({ inputValue });
</script>
<template>
  <div class="header">
    <UiInput
      placeholder="Input search..."
      class="searchbar"
      ref="inputElement"
      @input="onInputChange"
    />
    <UiButton
      class="filter"
      variant="secondary"
      @click="filterModalOpened = !filterModalOpened"
    >
      <PhFunnel :size="20" weight="fill" />
    </UiButton>
    <UiSearchFilter
      class="dropdown"
      :show="filterModalOpened"
      title="Filter"
      @close="filterModalOpened = false"
    >
      1
    </UiSearchFilter>
  </div>
</template>
<style lang="stylus" scoped>
.header
  position relative
  display flex
  justify-content center
  align-items center

  gap ss-xl-25
  padding ss-sm-10 ss-xl-25

  border-bottom 1px solid cs-outline

  .searchbar
    flex-grow 1

  .filter
    // Setting font size to 16 would lead to empty space in button
    font-size 0

  .dropdown
    position absolute
    bottom - ss-xl-25
    transform translateY(100%)
</style>
