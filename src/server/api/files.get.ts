import { prisma } from "@/server/libs/database";

/**
 * ## Get file by filename
 *
 * Endpoint processes Upload record
 * asynchronously updates the view count
 * & returns expanded ref object
 */
export default defineEventHandler<GetFileResponse>(async (event) => {
  const url = getRequestURL(event);
  const filename = url.searchParams.get("filename");

  if (!filename)
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Missing required parameter - filename.",
    });

  const upload = await prisma.upload.findUnique({
    where: { filename },
    include: {
      author: {
        include: {
          auth_key: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  if (!upload)
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "File not found.",
    });

  /**
   * prisma query calls are then-able so we wrap it with Promise
   * @see {@link https://stackoverflow.com/a/69461332/14301934 then-able implementation}
   */
  new Promise((resolve, reject) => {
    // Increment 1 view no matter what ip or smth
    prisma.upload
      .update({
        data: {
          views: { increment: 1 },
        },
        where: { id: upload.id },
      })
      .then(resolve)
      .catch(reject);
  });

  return {
    ...upload,
    // Remove original S3 url as we use repiping url/media/raw
    path: undefined,
    // Remove authorId as unnecessary
    authorId: undefined,
    author: {
      ...upload.author,
      username: upload?.author.auth_key[0].id.split(":")[1],
      auth_key: undefined,
      // Remove api_key & role for secure purposes
      api_key: undefined,
      role: undefined,
    },
  };
});
