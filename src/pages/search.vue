<script lang="ts" setup>
const cookie = useCookie("api_key");

if (!cookie.value) {
  await navigateTo("/login");
}

const input = ref<{ inputValue: string } | null>(null);
const computeInput = () => input.value?.inputValue ?? "";

</script>
<template>
  <div>
    <UiSearchHeader ref="input" />
    <UiUploads :filename="computeInput">
      <template v-slot:idle>
        <span class="center">
          Type your search query to find something 👏
        </span>
      </template>
      <template v-slot:no-posts>
        <span class="center">
          No posts were found, maybe try tweaking some filters?
        </span>
      </template>
    </UiUploads>
  </div>
</template>
<style lang="stylus" scoped>
.center
  display flex
  justify-content center
  align-items center
  color cs-dimmed

  padding ss-xxl-48 0
</style>
