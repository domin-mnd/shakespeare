import { db } from "~/database";
import { register } from "../utils/auth";

/**
 * ## User creation
 *
 * Endpoint processes 2 steps of validation & then handling record creation:
 *
 * - Validate an account that creates another user (must be ADMIN) (only if there are account records)
 * - Validate parameters & keys for creation
 * - Create the record in database via register()
 * - Handle conflict error
 */
export default defineEventHandler<
  CreateUserRequest,
  Promise<CreateUserResponse>
>(async event => {
  const { username, password, role, nickname, avatar_url } =
    await readBody(event);

  // Do not do authorization validation if there are no users registered yet
  if (await usersExist()) {
    const session = await validate(event);

    if (session === undefined)
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
        message: "Invalid credentials.",
      });

    const user = await db
      .selectFrom("auth_user")
      .where("id", "=", session.userId)
      .select("role")
      .executeTakeFirst();

    if (!user?.role || user.role !== "ADMIN")
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
        message: "Invalid role.",
      });
  }

  const nicknameType = typeof nickname;
  const avatarUrlType = typeof avatar_url;

  // Validation
  if (nicknameType !== "string" && nicknameType !== "undefined")
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "nickname isn't type of string.",
    });

  if (avatarUrlType !== "string" && avatarUrlType !== "undefined")
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "avatar_url isn't type of string.",
    });

  if (
    role !== "ADMIN" &&
    role !== "USER" &&
    typeof role !== "undefined"
  )
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "role key value isn't acceptable.",
    });

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
    const newUser = await register({
      avatar_url: avatar_url,
      nickname: nickname,
      password,
      role,
      username,
    });

    const session = await createSession(newUser.userId);
    setSession(event, session);
    setApiKey(event, newUser.apiKey);

    return {
      statusCode: 201,
      statusMessage: "Created",
      body: {
        id: newUser.userId,
        session,
        apikey: newUser.apiKey,
      },
    };
  } catch (error) {
    if (
      error instanceof AuthError &&
      error.message === AuthErrorMessage.UsernameTaken
    ) {
      throw createError({
        statusCode: 409,
        statusMessage: "Conflict",
        message: "Username already exists.",
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
