import { auth } from "@/server/utils";
import { LuciaError } from "lucia-auth";
import { prisma } from "@/server/libs/database";

/**
 * ## User creation
 *
 * Endpoint processes 2 steps of validation & then handling record creation:
 *
 * - Validate an account that creates another user (must be ADMIN)
 * - Validate parameters & keys for creation
 * - Create the record in database via lucia-auth
 * - Handle conflict error
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const apikey = getRequestHeader(event, "authorization");

  if (!apikey)
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: missing required header - authorization",
    });

  const user = await prisma.authUser.findUnique({
    where: { api_key: apikey },
    select: { role: true },
  });

  if (!user?.role || user.role !== "ADMIN")
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: invalid role for the given token",
    });

  // Required keys
  const username = body.username;
  const password = body.password;

  const nickname = typeof body.nickname;
  const avatar_url = typeof body.avatar_url;

  // Accepts only enum values
  const role = body.role;

  // Validation
  if (nickname !== "string" && nickname !== "undefined")
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: nickname isn't type of string",
    });

  if (avatar_url !== "string" && avatar_url !== "undefined")
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: avatar_url isn't type of string",
    });

  if (role !== "ADMIN" && role !== "USER" && typeof role !== "undefined")
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: role key value isn't acceptable",
    });

  if (!username || !password)
    throw createError({
      statusCode: 400,
      statusMessage:
        "Bad Request: missing required keys - username and password",
    });

  try {
    const newUser = await auth.createUser({
      primaryKey: {
        providerId: "username",
        providerUserId: username,
        password,
      },
      attributes: {
        // Additional parameter fields
        nickname: body.nickname,
        avatar_url: body.avatar_url,
        role: body.role,
      },
    });

    return {
      statusCode: 201,
      statusMessage: "Created",
      body: newUser,
    };
  } catch (error) {
    if (
      error instanceof LuciaError &&
      error.message === "AUTH_DUPLICATE_KEY_ID"
    ) {
      throw createError({
        statusCode: 409,
        statusMessage: "Conflict: username already exists",
      });
    } else {
      console.log(error);
      throw createError({
        statusCode: 500,
        statusMessage: "Internal Server Error: check console",
      });
    }
  }
});
