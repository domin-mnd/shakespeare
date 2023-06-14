<script lang="ts" setup>
const { label, position, withArrow } = defineProps([
  "label",
  "position",
  "withArrow",
]);

const displayArrow = withArrow !== undefined ? 1 : 0;
</script>
<template>
  <div class="tooltip-wrapper" :data-position="position ?? 'top'">
    <div class="tooltip-content">
      <div class="tooltip" role="tooltip">{{ label }}</div>
      <div class="arrow"></div>
    </div>
    <slot />
  </div>
</template>
<style lang="stylus" scoped>
.tooltip-wrapper
  display flex
  position relative
  width max-content

  .tooltip-content
    pointer-events none
    position absolute
    z-index 10

    display flex
    align-items center

    transition opacity .3s ease
    opacity 0

  &:hover .tooltip-content
    transition opacity .3s ease
    opacity 1

  .tooltip
    width max-content
    max-width 190px
    padding ss-sm-10 ss-md-12

    border-radius rs-md-6
    background-color cs-overlay

    color cs-secondary
    box-shadow rgba(0, 0, 0, 0.2) 0 8px 16px 0
    font-size fs-md-15
    line-height ss-md-16

  .arrow
    border 5px solid transparent
    border-top-color cs-overlay
    opacity v-bind(displayArrow)

    width 0
    height 0

.tooltip-wrapper[data-position=top]
  .tooltip-content
    left 50%
    transform translate(-50%, -100%)
    flex-direction column

  .arrow
    margin-top -1px

.tooltip-wrapper[data-position=bottom]
  .tooltip-content
    left 50%
    bottom 0
    transform translate(-50%, 100%)
    flex-direction column-reverse

  .arrow
    margin-top 2px
    transform rotate(180deg)

.tooltip-wrapper[data-position=left]
  .tooltip-content
    top 50%
    left 0
    transform translate(-100%, -50%)
    flex-direction row

  .arrow
    transform rotate(-90deg)

.tooltip-wrapper[data-position=right]
  .tooltip-content
    top 50%
    right 0
    transform translate(100%, -50%)
    flex-direction row-reverse

  .arrow
    transform rotate(90deg)
</style>
