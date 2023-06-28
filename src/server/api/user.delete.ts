import { LuciaError } from "lucia-auth";
import { prisma } from "@/server/libs/database";

/**
 * ## User deletion
 *
 * Endpoint processes 2 steps of validation & then handling record deletion:
 *
 * - Validate an account that deletes another user
 * - Delete the record in database via lucia-auth
 * - Handle conflict error
 */
export default defineEventHandler<DeleteUserResponse>(async (event) => {
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

  // Validation
  if (!userId)
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Missing required key - userId."
    });

  if (typeof userId !== "string")
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "userId must be a string."
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

  try {
    await auth.deleteUser(userId);
  } catch (error) {
    if (
      error instanceof LuciaError &&
      error.message === "AUTH_INVALID_USER_ID"
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: "Conflict",
        message: "Invalid userId.",
      });
    } else {
      console.error(error);
      throw createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
        message: "An unknown error has occured. Please consider checking console output for more information."
      });
    }
  }

  return {
    statusCode: 200,
    statusMessage: "OK",
  };
});
