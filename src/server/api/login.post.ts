import { db } from "@/database";

/**
 * ## User login
 *
 * Endpoint validates username and password and creates a session.
 */
export default defineEventHandler<
  LoginUserRequest,
  Promise<LoginUserResponse>
>(async event => {
  // Required keys
  const { username, password } = await readBody(event);

  if (!username || !password)
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Missing required keys - username or password.",
    });

  // Validate username
  if (username.length < 3)
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Username should be at least 3 characters long.",
    });
  if (username.length > 20)
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Username should be at most 20 characters long.",
    });
  if (!/^[a-z0-9_]+$/.test(username))
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message:
        "Username should be lowercase and can only include latin characters, numbers & underscore.",
    });

  // Validate password
  if (password.length < 4) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Password should be at least 4 characters long.",
    });
  }

  try {
    const session = await login(username, password);
    setSession(event, session);

    const apikey = await db
      .selectFrom("auth_key")
      .where("username", "=", username)
      .select(({ selectFrom }) => [
        selectFrom("auth_user")
          .whereRef("auth_key.id", "=", "user_id")
          .select("api_key")
          .as("api_key"),
      ])
      .executeTakeFirst();

    setApiKey(event, apikey?.api_key as string);

    return {
      statusCode: 200,
      statusMessage: "OK",
      body: {
        apikey: apikey?.api_key as string,
        session,
      },
    };
  } catch (error) {
    if (
      error instanceof AuthError &&
      error.message === AuthErrorMessage.InvalidCredentials
    ) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
        message: "Incorrect username or password.",
      });
    } else {
      console.error(error);
      throw createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
        message:
          "An unknown error has occured. Please consider checking console output for more information.",
      });
    }
  }
});
