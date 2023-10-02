import { prisma } from "@/server/libs/database";

/**
 * ## Get user by its username
 *
 * Validates the caller user, then returns
 * the user found by the username body parameter
 */
export default defineEventHandler<GetUserRequest, Promise<GetUserResponse>>(async (event) => {
  const { username } = getQuery(event);
  const apikey = getRequestHeader(event, "authorization");

  if (!apikey)
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Missing required header - authorization.",
    });

  // Validate required data
  if (!username)
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Missing required key - username.",
    });

  const caller = await prisma.authUser.findUnique({
    where: { api_key: apikey },
    select: { id: true },
  });

  if (!caller)
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Invalid credentials.",
    });

  // auth.getUser() requires userId, not username
  const user = await prisma.authKey.findUnique({
    // Single auth type therefore it is needed to prepend username:
    where: { id: `username:${username}` },
    select: {
      id: true,
      auth_user: {
        select: {
          id: true,
          nickname: true,
          avatar_url: true,
        },
      },
    },
  });

  if (!user)
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "User not found.",
    });

  return {
    username: user.id.split(":")[1],
    ...user.auth_user,
  };
});
