<script lang="ts" setup>
definePageMeta({
  layout: false,
});
const { data } = await useFetch("/api/user");

if (!data.value) throw createError("Failed to fetch data");

if (data.value.userId || data.value.usersExist) navigateTo("/login");

const usernameErrors: string[] = [
  "Username should be lowercase and can only include latin characters, numbers & underscore",
  "Username should be at least 3 characters long",
  "Username should be at most 20 characters long",
  "Username is already taken",
];

const passwordErrors: string[] = [
  "Password should be at least 4 characters long",
];

const passwordConfirmErrors: string[] = ["Passwords do not match"];

interface Tooltip {
  label: string;
  show: boolean;
}

const loading = ref<boolean>(false);
const usernameTooltip = reactive<Tooltip>({
  label: usernameErrors[0],
  show: false,
});
const passwordTooltip = reactive<Tooltip>({
  label: passwordErrors[0],
  show: false,
});
const passwordConfirmTooltip = reactive<Tooltip>({
  label: passwordConfirmErrors[0],
  show: false,
});

function validateUsername(username: string) {
  const regex = /^[a-z0-9_]+$/;
  if (username.length < 3) {
    usernameTooltip.label = usernameErrors[1];
    usernameTooltip.show = true;
    return false;
  }
  if (username.length > 20) {
    usernameTooltip.label = usernameErrors[2];
    usernameTooltip.show = true;
    return false;
  }
  if (!regex.test(username)) {
    usernameTooltip.label = usernameErrors[0];
    usernameTooltip.show = true;
    return false;
  }
  return true;
}

function validatePassword(password: string) {
  if (password.length < 4) {
    passwordTooltip.label = passwordErrors[0];
    passwordTooltip.show = true;
    return false;
  }
  return true;
}

function validatePasswordConfirm(password: string, passwordConfirm: string) {
  if (password !== passwordConfirm) {
    passwordConfirmTooltip.label = passwordConfirmErrors[0];
    passwordConfirmTooltip.show = true;
    return false;
  }
  return true;
}

function onFormSubmit(event: Event) {
  event.preventDefault();

  const formData = new FormData(event.target as HTMLFormElement);

  const data = Object.fromEntries(formData);

  if (!validateUsername(data.username as string)) return;
  if (!validatePassword(data.password as string)) return;
  if (
    !validatePasswordConfirm(
      data.password as string,
      data["password-confirm"] as string
    )
  )
    return;

  loading.value = true;
}
</script>
<template>
  <div>
    <NuxtLayout name="client">
      <UiForm @submit="onFormSubmit">
        <UiGroup>
          <UiTooltip
            :label="usernameTooltip.label"
            :show="usernameTooltip.show"
            @input="usernameTooltip.show = false"
            position="bottom"
            with-arrow
            dont-show-on-hover
          >
            <UiField
              field-name="username"
              placeholder="crazyjoe168"
              label="Username"
              note="Permanent identifier"
              required
            />
          </UiTooltip>
          <UiField
            field-name="nickname"
            placeholder="Crazy Joe"
            label="Nickname"
          />
          <UiField
            field-name="avatar"
            placeholder="Link to an image..."
            label="Avatar"
            type="file"
            accept="image/*"
          />
        </UiGroup>
        <UiGroup>
          <UiTooltip
            :label="passwordTooltip.label"
            :show="passwordTooltip.show"
            @input="passwordTooltip.show = false"
            position="bottom"
            with-arrow
            dont-show-on-hover
          >
            <UiField
              field-name="password"
              label="Password"
              type="password"
              required
            />
          </UiTooltip>
          <UiTooltip
            :label="passwordConfirmTooltip.label"
            :show="passwordConfirmTooltip.show"
            @input="passwordConfirmTooltip.show = false"
            position="bottom"
            with-arrow
            dont-show-on-hover
          >
            <UiField
              field-name="password-confirm"
              label="Confirm password"
              type="password"
              required
            />
          </UiTooltip>
        </UiGroup>
        <div id="submit-footer">
          <span id="note">
            Your account will be assigned as an Administrator
          </span>
          <UiButton id="button"> Register </UiButton>
        </div>
        <UiLoadingOverlay :loading="loading" />
      </UiForm>
    </NuxtLayout>
  </div>
</template>
<style lang="stylus" scoped>
#submit-footer
  display flex
  justify-content space-between
  align-items center

  #note
    color cs-dimmed
    font-size fs-md-16

  @media screen and (max-width 468px)
    flex-direction column-reverse
    gap ss-sm-10

    #button
      width 100%

    #note
      text-align center
</style>
