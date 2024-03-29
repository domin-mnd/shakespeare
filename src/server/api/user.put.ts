import { LuciaError } from "lucia";
import { prisma } from "@/server/libs/database";

/**
 * ## User attribute updates
 *
 * Endpoint processes 2 steps of validation & then handling record update:
 *
 * - Validate an account that deletes another user
 * - Validate attributes
 * - Update the record attributes in database via lucia & invalidate sessions
 * - Handle conflict error
 */
export default defineEventHandler<
  UpdateUserRequest,
  Promise<UpdateUserResponse>
>(async (event) => {
  const body = await readBody(event);
  const apikey = getRequestHeader(event, "authorization");

  if (!apikey)
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Missing required header - authorization.",
    });

  // Required keys
  const userId = body.userId;

  // Validate required data
  if (!userId)
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Missing required key - userId.",
    });

  if (typeof userId !== "string")
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "userId must be a string.",
    });

  const user = await prisma.authUser.findUnique({
    where: { api_key: apikey },
    select: { id: true, role: true },
  });

  if (!user || (user?.role !== "ADMIN" && user?.id !== userId))
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Invalid credentials.",
    });

  // Validate attributes
  const nickname = typeof body.nickname;
  const avatar_url = typeof body.avatar_url;

  // Accepts only enum values
  const role = body.role;

  if (nickname !== "string" && nickname !== "undefined")
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "nickname isn't type of string.",
    });

  if (avatar_url !== "string" && avatar_url !== "undefined")
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

  if (user?.id === userId && role === "ADMIN")
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Own role cannot be promoted to ADMIN.",
    });

  const partialUserAttributes = {
    nickname: body.nickname,
    avatar_url: body.avatar_url,
    role,
  };

  try {
    const updatedUser = await auth.updateUserAttributes(
      userId,
      partialUserAttributes,
    );

    await auth.invalidateAllUserSessions(updatedUser.userId);
    const session = await auth.createSession(updatedUser.userId);
    const cookie = auth.createSessionCookie(session).serialize();
    setHeader(event, "Set-Cookie", cookie);

    return {
      statusCode: 200,
      statusMessage: "OK",
      session,
    };
  } catch (error) {
    if (
      error instanceof LuciaError &&
      error.message === "AUTH_INVALID_USER_ID"
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "Invalid userId.",
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
