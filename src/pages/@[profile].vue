<script lang="ts" setup>
const state = useUserStore();
const route = useRoute();

let notFound: boolean = false;
const user = {
  avatarUrl: state.avatar_url,
  nickname: state.nickname,
  username: state.username as string,
  withEditButton: true,
};

if (state.username !== route.fullPath.split("@")[1]) {
  user.withEditButton = false;
  const cookie = useCookie("api_key");

  if (!cookie.value) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const { data, error } = await useFetch("/api/user", {
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
