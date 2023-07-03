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
    <UiUploads :username="user.username">
      <template v-slot:posts="{ posts }">
        <div class="compact-user-posts">
          <div class="column">
            <template v-for="(post, index) in posts" :key="index">
              <NuxtLink
                v-if="index % 2 === 0"
                :to="'/' + post.filename"
                class="link"
              >
                <UiPostMedia :src="'/' + post.filename + '/raw'" />
              </NuxtLink>
            </template>
          </div>
          <div class="column">
            <template v-for="(post, index) in posts" :key="index">
              <NuxtLink
                v-if="index % 2 === 1"
                :to="'/' + post.filename"
                class="link"
              >
                <UiPostMedia :src="'/' + post.filename + '/raw'" />
              </NuxtLink>
            </template>
          </div>
        </div>
      </template>
      <template v-slot:no-posts><span></span></template>
    </UiUploads>
  </div>
  <div v-else>
    <UiProfileHeader username="No user found!" :with-edit-button="false" />
  </div>
</template>
<style lang="stylus">
.compact-user-posts
  margin-top ss-xl-25
  display grid
  grid-template-columns 1fr 1fr
  padding ss-sm-10
  gap ss-sm-10

  .column
    display flex
    flex-direction column
    gap ss-sm-10
    border-bottom none

  .link
    font-size 0
    transition opacity .3s ease

    &:hover
      transition opacity .3s ease
      opacity 0.7

    &:active
      transition opacity .3s ease
      opacity 0.5
</style>
