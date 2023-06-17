import { auth } from "@/server/utils";
import { LuciaError } from "lucia-auth";
import { prisma } from "@/server/libs/database";

/**
 * ## User creation
 *
 * Endpoint processes 2 steps of validation & then handling record creation:
 *
 * - Validate an account that creates another user (must be ADMIN) (only if there are account records)
 * - Validate parameters & keys for creation
 * - Create the record in database via lucia-auth
 * - Handle conflict error
 */
export default defineEventHandler<LoginUserResponse>(async (event) => {
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
    const authRequest = auth.handleRequest(event);
    const key = await auth.useKey("username", username, password);
    const session = await auth.createSession(key.userId);
    authRequest.setSession(session);

    const apikey = await prisma.authKey.findUnique({
      where: { id: `username:${username}` },
      select: {
        auth_user: {
          select: {
            api_key: true,
          },
        },
      },
    });

    return {
      statusCode: 200,
      statusMessage: "OK",
      body: {
        apikey: apikey?.auth_user.api_key as string,
        session,
      },
    };
  } catch (error) {
    if (
      error instanceof LuciaError &&
      (error.message === "AUTH_INVALID_KEY_ID" ||
        error.message === "AUTH_INVALID_PASSWORD")
    ) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
        message: "Incorrect username or password.",
      });
    } else {
      console.log(error);
      throw createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
        message: "An unknown error has occured. Please consider checking console output for more information.",
      });
    }
  }
});
