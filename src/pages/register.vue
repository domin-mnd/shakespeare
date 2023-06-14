<script lang="ts" setup>
definePageMeta({
  layout: false,
});
const { data } = await useFetch("/api/user");

if (!data.value) throw createError("Failed to fetch data");

if (data.value.user || data.value.usersExist) navigateTo("/login");
</script>
<template>
  <div>
    <NuxtLayout name="client">
      8
    </NuxtLayout>
  </div>
</template>