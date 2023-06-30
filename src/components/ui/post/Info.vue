<script lang="ts" setup>
const {
  date,
  views
} = defineProps<{
  date: string;
  views: number;
}>();

const postDate = new Date(date);
const minutes =
  postDate.getMinutes().toString().length === 1
    ? `0${postDate.getMinutes()}`
    : postDate.getMinutes();
const hours = postDate.getHours();
const day = postDate.getDate();
const month = postDate.toLocaleString("default", { month: "short" });
const year = postDate.getFullYear();
</script>
<template>
  <div class="info">
    <span class="timestamp">
      {{ new Date().getFullYear() !== year ? year + ", " : undefined }}{{ month }} {{ day }}, {{ hours }}:{{ minutes }}
    </span>
    <div class="views">
      <span class="count">
        {{ views }}
      </span>
      <span class="label">
        {{ views === 1 ? 'View' : 'Views' }}
      </span>
    </div>
  </div>
</template>
<style lang="stylus" scoped>
.info
  display flex
  justify-content space-between

  padding-left ss-sm-10
  padding-right ss-sm-10

  .timestamp
    font-size fs-md-15
    color cs-secondary
  
  .views
    display flex
    gap ss-xs-3

    .count
      font-size fs-md-16
      color cs-primary
    
    .label
      font-size fs-md-16
      color cs-secondary
</style>