import { db } from "@/database";

/**
 * ## User deletion
 *
 * Endpoint processes 2 steps of validation & then handling record deletion:
 *
 * - Validate an account that deletes another user
 * - Delete the record in database via deleteUser()
 * - Handle conflict error
 */
export default defineEventHandler<
  DeleteUserRequest,
  Promise<DeleteUserResponse>
>(async event => {
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
      message: "Missing required key - userId.",
    });

  if (typeof userId !== "number")
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "userId must be a number.",
    });

  const user = await db
    .selectFrom("auth_user")
    .where("api_key", "=", apikey)
    .select(["id", "role"])
    .executeTakeFirst();

  if (!user || (user?.role !== "ADMIN" && user?.id !== userId))
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Invalid credentials.",
    });

  try {
    await deleteUser(userId);
  } catch (error) {
    if (
      error instanceof AuthError &&
      error.message === AuthErrorMessage.InvalidId
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
        message:
          "An unknown error has occured. Please consider checking console output for more information.",
      });
    }
  }

  return {
    statusCode: 200,
    statusMessage: "OK",
  };
});
