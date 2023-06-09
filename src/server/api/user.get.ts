import { auth } from "@/server/utils";
import { LuciaError } from "lucia-auth";
import { prisma } from "@/server/libs/database";

/**
 * ## Get user by its username
 *
 * Validates the caller user, then returns
 * the user found by the username body parameter
 */
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);
  const username = url.searchParams.get("username");
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
    include: {
      auth_user: {
        include: {
          uploads: true,
        }
      }
    },
  });

  if (!user)
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
    });

  return {
    ...user.auth_user,
    api_key: undefined,
    role: undefined,
  }
});
