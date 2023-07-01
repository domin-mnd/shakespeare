<script lang="ts" setup>
const state = useUser();
const route = useRoute();

let notFound: boolean = false;
const user = {
  avatarUrl: state.value.avatar_url,
  nickname: state.value.nickname,
  username: state.value.username as string,
  withEditButton: true,
};

if (state.value.username !== route.fullPath.split("@")[1]) {
  user.withEditButton = false;
  const cookie = useCookie("api_key");

  if (!cookie.value) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const { data } = await useFetch("/api/user", {
    params: {
      username: route.fullPath.split("@")[1],
      quantity: 15,
    },
    headers: {
      Authorization: cookie.value,
    },
  });

  if (data.value) {
    user.avatarUrl = data.value.avatar_url;
    user.nickname = data.value.nickname;
    user.username = data.value.username;
  } else {
    notFound = true;
  }
}

useHead({
  title: user.nickname || user.username || "No user found!",
});
</script>
<template>
  <div v-if="!notFound">
    <UiProfileHeader
      :avatar-url="user.avatarUrl"
      :nickname="user.nickname"
      :username="user.username"
      :with-edit-button="user.withEditButton"
    />
    <UiProfileChart :username="user.username" />
  </div>
  <div v-else>
    <UiProfileHeader
      username="No user found!"
      :with-edit-button="false"
    />
  </div>
</template>
