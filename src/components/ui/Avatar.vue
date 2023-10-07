<script lang="ts" setup>
const { src, nickname, size } = defineProps<{
  src?: string | null;
  nickname?: string;
  size: number;
}>();

const avatarSize = size + "px";
const presetLetterSize = size * 0.7 + "px";
</script>
<template>
  <img
    v-if="src"
    :src="src"
    :alt="nickname"
    loading="lazy"
    class="avatar"
    v-bind="$attrs"
  />
  <div v-else class="avatar preset">
    {{ (nickname ?? "").split("")[0] }}
  </div>
</template>
<style lang="stylus" scoped>
.avatar
  border-radius rs-circle
  object-fit cover
  width v-bind(avatarSize)
  height v-bind(avatarSize)
  background-color cs-outline
  color transparent

  &.preset
    display flex
    align-items center
    justify-content center

    background-color cs-outline
    color cs-dimmed
    aspect-ratio 1

    font-size v-bind(presetLetterSize)
    font-weight bold
    text-align center
    user-select none
</style>
