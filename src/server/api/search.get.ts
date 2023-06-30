import { prisma } from "@/server/libs/database";

/**
 * ## Get files by similar filename
 *
 * Endpoint processes upload record
 * & returns expanded mapped ref object
 */
export default defineEventHandler<SearchResponse>(async (event) => {
  const url = getRequestURL(event);
  // Array size for search
  const quantity = url.searchParams.get("quantity") ?? 30;
  /**
   * @see {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination}
   */
  const page = url.searchParams.get("page") ?? 1;
  // Filename query
  const filename = url.searchParams.get("query") ?? "";
  // Checkout cuid API key, authorization header key for every user
  const apikey = getRequestHeader(event, "authorization");

  if (!apikey)
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Missing apikey authorization header.",
    });

  const user = await prisma.authUser.findUnique({
    where: { api_key: apikey },
    select: { id: true, role: true },
  });

  if (!user)
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Invalid credentials.",
    });

  const condition =
    user.role === "ADMIN"
      ? {}
      : {
          authorId: user.id,
        };

  const upload = await prisma.upload.findMany({
    skip: (+page - 1) * +quantity,
    take: +quantity,
    orderBy: {
      created_at: "desc",
    },
    where: {
      filename: {
        contains: filename,
      },
      ...condition,
    },
    include: {
      author: {
        select: {
          id: true,
          nickname: true,
          avatar_url: true,
          auth_key: {
            take: 1,
            select: {
              id: true,
            }
          }
        }
      }
    },
  });

  return upload.map((file) => ({
    ...file,
    // Remove authorId as unnecessary
    authorId: undefined,
    author: {
      id: file.author.id,
      avatar_url: file.author.avatar_url,
      nickname: file.author.nickname,
      username: file.author.auth_key[0].id.split(":")[1],
    },
  }));
});
