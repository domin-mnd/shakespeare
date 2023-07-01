<script lang="ts" setup>
const state = useUser();
const route = useRoute();

let notFound: boolean = false;
const user = {
  avatarUrl: state.value.avatar_url,
  nickname: state.value.nickname,
  username: state.value.username as string,
  isProfile: true,
};

if (state.value.username !== route.fullPath.split("@")[1]) {
  user.isProfile = false;
  const cookie = useCookie("api_key");

  if (!cookie.value) {
    await navigateTo("/login");
  }

  const { data } = await useFetch("/api/user", {
    params: {
      username: route.fullPath.split("@")[1],
      quantity: 15,
    },
    headers: {
      Authorization: cookie.value as string,
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

onMounted(() => {
  // When visiting profile scroll to top
  const layout = document.getElementById("__nuxt");
  layout?.scrollTo(0, 0);
});
</script>
<template>
  <div v-if="!notFound">
    <UiProfileHeader
      :avatar-url="user.avatarUrl"
      :nickname="user.nickname"
      :username="user.username"
      :with-edit-button="user.isProfile"
    />
    <UiProfileChart :username="user.username" />
    <div class="user-posts">      
      <UiUploads :username="user.username">
        <template v-slot:no-posts><span></span></template>
      </UiUploads>
    </div>
  </div>
  <div v-else>
    <UiProfileHeader
      username="No user found!"
      :with-edit-button="false"
    />
  </div>
</template>
<style lang="stylus" scoped>
.user-posts
  margin-top ss-xl-25
</style>