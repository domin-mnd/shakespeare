import { prisma } from "@/server/libs/database";

/**
 * ## Get files by similar filename
 *
 * Endpoint processes upload record
 * & returns expanded mapped ref object
 */
export default defineEventHandler<GetViewsResponse>(async (event) => {
  const url = getRequestURL(event);
  // Ranges, convert nullish to undefined
  const lte = url.searchParams.get("lte") ?? undefined; // Less than or equal to
  const gte = url.searchParams.get("gte") ?? undefined; // Greater than or equal to
  const lt = url.searchParams.get("lt") ?? undefined; // Less than or equal
  const gt = url.searchParams.get("gt") ?? undefined; // Greater than or equal
  const username = url.searchParams.get("username");

  // Checkout cuid API key, authorization header key for every user
  const apikey = getRequestHeader(event, "authorization");

  if (!apikey)
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Missing apikey authorization header.",
    });

  let user = await prisma.authUser.findUnique({
    where: { api_key: apikey },
    select: { id: true },
  });

  if (!user)
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Invalid credentials.",
    });

  // Find either profile user or the given user
  if (username) {
    user = await prisma.authKey
      .findUnique({
        where: {
          id: `username:${username}`,
        },
        select: {
          id: true,
        },
      })
      .auth_user();
  }

  if (!user)
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "User not found.",
    });

  const views = await prisma.view.findMany({
    where: {
      upload: {
        authorId: user.id,
      },
      // Date range e.g.
      // lte: "2022-01-30"
      // gte: "2022-01-15"
      created_at: {
        // Converted toISOStrings
        lte, gte, lt, gt
      },
    },
    select: {
      created_at: true,
    },
  });

  return views;
});
