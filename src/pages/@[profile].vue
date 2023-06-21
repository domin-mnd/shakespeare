<script lang="ts" setup>
const state = useUserStore();
</script>
<template>
  <div>
    <UiProfileHeader
      :avatar-url="state.avatar_url"
      :nickname="state.nickname"
      :username="(state.username as string)"
      :with-edit-button="true"
    />
    <UiProfileChart />
  </div>
</template>
