<script lang="ts" setup>
const { data } = await useFetch("/api/profile");

if (!data.value) throw createError("Failed to fetch data");

if (!data.value.usersExist) await navigateTo("/register");
if (data.value.userId) await navigateTo("/");

definePageMeta({
  layout: "client",
});

useHead({
  title: "Login",
});

interface Modal {
  title: string;
  content: string;
  show: boolean;
}

interface Loading {
  state: string;
  show: boolean;
}

const loading = reactive<Loading>({
  state: "Logging into an account...",
  show: false,
});
const error = reactive<Modal>({
  title: "An error occured",
  content:
    "An unknown error has occured. Please consider checking console output for more information.",
  show: false,
});

async function login(event: Event) {
  loading.show = true;
  event.preventDefault();

  const formData = new FormData(event.target as HTMLFormElement);

  const { data, error: errorResponse } = await useFetch("/api/login", {
    method: "POST",
    body: Object.fromEntries(formData.entries()),
  });

  if (errorResponse.value) {
    loading.show = false;
    error.title = errorResponse.value?.data.statusMessage ?? "An error occured";
    error.content =
      errorResponse.value?.data.message ??
      "An unknown error has occured. Please consider checking console output for more information.";
    error.show = true;
  }

  if (data.value) {
    const apiKeyCookie = useCookie("api_key", {
      expires: new Date(data.value.body.session.idlePeriodExpiresAt),
      sameSite: "lax",
    });

    apiKeyCookie.value = data.value.body.apikey;

    loading.show = true;
    await navigateTo("/");
  }
}
</script>
<template>
  <div id="padding">
    <UiForm @submit="login">
      <UiGroup>
        <UiField
          field-name="username"
          placeholder="crazyjoe168"
          label="Username"
        />
        <UiField
          field-name="password"
          label="Password"
          type="password"
          required
        />
      </UiGroup>
      <div id="submit-footer">
        <UiButton id="button"> Login </UiButton>
      </div>
    </UiForm>

    <UiOverlayLoading :show="loading.show" :state="loading.state" />
    <UiOverlayError
      :show="error.show"
      :title="error.title"
      :content="error.content"
      @close="error.show = false"
    />
  </div>
</template>
<style lang="stylus" scoped>
#padding
  padding-left ss-xl-25
  padding-right ss-xl-25

#submit-footer
  display flex
  justify-content flex-end
</style>
