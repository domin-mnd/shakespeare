import { db } from "@/database";

/**
 * ## Validate user via authentication library
 *
 * Validates the caller user, then returns
 * the userId validated by validate(),
 * also returns whether any users are registered.
 */
export default defineEventHandler<
  GetProfileRequest,
  Promise<GetProfileResponse>
>(async event => {
  const user = await validate(event);

  if (!user?.userId) {
    return {
      userId: undefined,
      body: {},
      usersExist: await usersExist(),
      statusCode: 200,
      statusMessage: "OK",
    };
  }

  const userData = await db
    .selectFrom("auth_user")
    .where("id", "=", user.userId)
    .select(({ selectFrom }) => [
      "id",
      "nickname",
      "avatar_url",
      selectFrom("auth_key")
        .whereRef("auth_key.user_id", "=", "auth_user.id")
        .select("username")
        .as("username"),
    ])
    .executeTakeFirst();

  return {
    userId: user?.userId,
    body: {
      nickname: userData?.nickname,
      avatar_url: userData?.avatar_url,
      username: userData?.username ?? undefined,
    },
    // it's obvious that any user exists if userId is returned
    usersExist: true,
    statusCode: 200,
    statusMessage: "OK",
  };
});
