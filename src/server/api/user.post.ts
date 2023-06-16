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
export default defineEventHandler<CreateUserResponse>(async (event) => {
  const body = await readBody(event);

  const usersExist = await prisma.authUser
    .findMany({
      select: { id: true }, // this line might not be necessary
      take: 1, // this is the important bit, do not check through all the records
    })
    .then((r) => r.length > 0);

  // Do not do authorization validation if there are no users registered yet
  if (usersExist) {
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
  }

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
        "Bad Request: missing required keys - username or password",
    });

  // Validate username
  if (username.length < 3)
    throw createError({
      statusCode: 400,
      statusMessage:
        "Bad Request: username should be at least 3 characters long",
    });
  if (username.length > 20)
    throw createError({
      statusCode: 400,
      statusMessage:
        "Bad Request: username should be at most 20 characters long",
    });
  if (!/^[a-z0-9_]+$/.test(username))
    throw createError({
      statusCode: 400,
      statusMessage:
        "Bad Request: username should be lowercase and can only include latin characters, numbers & underscore",
    });
  
  // Validate password
  if (password.length < 4) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "Bad Request: password should be at least 4 characters long",
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
        nickname: body.nickname,
        avatar_url: body.avatar_url,
        role: body.role,
      },
    });

    const session = await auth.createSession(newUser.userId);
    const cookie = auth.createSessionCookie(session).serialize();
    setHeader(event, "Set-Cookie", cookie);

    const apikey = await prisma.authUser.findUnique({
      where: { id: newUser.userId },
      select: { api_key: true },
    })

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
