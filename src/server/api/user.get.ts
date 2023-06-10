import { prisma } from "@/server/libs/database";

/**
 * ## Get user by its username
 *
 * Validates the caller user, then returns
 * the user found by the username body parameter
 */
export default defineEventHandler<GetUserResponse>(async (event) => {
  const url = getRequestURL(event);
  // Username
  const username = url.searchParams.get("username");
  // Amount of uploads to return
  const quantity = url.searchParams.get("quantity") ?? 15;
  const apikey = getRequestHeader(event, "authorization");

  if (!apikey)
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: missing required header - authorization",
    });

  // Validate required data
  if (!username)
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: missing required key - username",
    });

  const caller = await prisma.authUser.findUnique({
    where: { api_key: apikey },
    select: { id: true },
  });

  if (!caller)
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: invalid credentials",
    });

  // auth.getUser() requires userId, not username
  const user = await prisma.authKey.findUnique({
    // Single auth type therefore it is needed to prepend username:
    where: { id: `username:${username}` },
    select: {
      auth_user: {
        select: {
          id: true,
          nickname: true,
          avatar_url: true,
          uploads: {
            take: +quantity,
            orderBy: {
              created_at: "desc",
            }
          },
        },
      },
    },
  });

  if (!user)
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
    });

  return user.auth_user;
});
