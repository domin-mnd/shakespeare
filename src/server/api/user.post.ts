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
export default defineEventHandler<CreateUserRequest, Promise<CreateUserResponse>>(async (event) => {
  const { username, password, role, nickname, avatar_url } = await readBody(event);

  const usersExist = await prisma.authUser
    .findMany({
      select: { id: true }, // this line might not be necessary
      take: 1, // this is the important bit, do not check through all the records
    })
    .then((r) => r.length > 0)
    .catch(() => false);

  // Do not do authorization validation if there are no users registered yet
  if (usersExist) {
    const apikey = getRequestHeader(event, "authorization");

    if (!apikey)
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
        message: "Missing required header - authorization.",
      });

    const user = await prisma.authUser.findUnique({
      where: { api_key: apikey },
      select: { role: true },
    });

    if (!user?.role || user.role !== "ADMIN")
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
        message: "Invalid role for the given token.",
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

  if (role !== "ADMIN" && role !== "USER" && typeof role !== "undefined")
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
    const newUser = await auth.createUser({
      primaryKey: {
        providerId: "username",
        providerUserId: username,
        password,
      },
      attributes: {
        // Additional parameter fields
        nickname,
        avatar_url,
        role: role as "ADMIN" | "USER",
      },
    });

    const session = await auth.createSession(newUser.userId);
    const cookie = auth.createSessionCookie(session).serialize();
    setHeader(event, "Set-Cookie", cookie);

    const apikey = await prisma.authUser.findUnique({
      where: { id: newUser.userId },
      select: { api_key: true },
    });

    return {
      statusCode: 201,
      statusMessage: "Created",
      body: {
        id: newUser.userId,
        session,
        apikey: apikey?.api_key as string,
      },
    };
  } catch (error) {
    if (
      error instanceof LuciaError &&
      error.message === "AUTH_DUPLICATE_KEY_ID"
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
        message: "An unknown error has occured. Please consider checking console output for more information.",
      });
    }
  }
});
