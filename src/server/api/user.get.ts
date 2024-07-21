import { db } from "@/database";

/**
 * ## Get user by its username
 *
 * Validates the caller user, then returns
 * the user found by the username body parameter
 */
export default defineEventHandler<
  GetUserRequest,
  Promise<GetUserResponse>
>(async event => {
  const { username } = getQuery(event);

  // Validate required data
  if (!username)
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Missing required key - username.",
    });

  const caller = await validate(event);

  if (caller === undefined)
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Invalid credentials.",
    });

  const user = await db
    .selectFrom("auth_key")
    .where("username", "=", username)
    .select(({ selectFrom }) => [
      "username",
      selectFrom("auth_user")
        .whereRef("auth_key.user_id", "=", "auth_user.id")
        .select("id")
        .as("id"),
      selectFrom("auth_user")
        .whereRef("auth_key.user_id", "=", "auth_user.id")
        .select("nickname")
        .as("nickname"),
      selectFrom("auth_user")
        .whereRef("auth_key.user_id", "=", "auth_user.id")
        .select("avatar_url")
        .as("avatar_url"),
    ])
    .executeTakeFirst();

  if (!user)
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "User not found.",
    });

  return {
    id: user.id as number,
    username: user.username,
    nickname: user.nickname ?? null,
    avatar_url: user.avatar_url ?? null,
  };
});
