import { prisma } from "@/server/libs/database";

/**
 * ## Get files by similar filename
 *
 * Endpoint processes upload record
 * & returns expanded mapped ref object
 */
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);
  const filename = url.searchParams.get("q");
  // Checkout cuid API key, authorization header key for every user
  const apikey = getRequestHeader(event, "authorization");

  if (!apikey)
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: missing apikey authorization header",
    });

  const user = await prisma.authUser.findUnique({
    where: { api_key: apikey },
  });

  if (!user)
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: invalid credentials",
    });

  const condition =
    user.role === "ADMIN"
      ? {}
      : {
          authorId: user.id,
        };

  const upload = await prisma.upload.findMany({
    where: {
      filename: {
        contains: filename ?? "",
      },
      ...condition,
    },
    include: { author: true },
  });

  return upload.map((file) => ({
    ...file,
    // Remove authorId as unnecessary
    authorId: undefined,
    author: {
      ...file.author,
      // Remove api_key & role for secure purposes
      api_key: undefined,
      role: undefined,
    },
  }));
});
