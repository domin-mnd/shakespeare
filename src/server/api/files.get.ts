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
    // include: {
    //   author: {
    //     include: {
    //       auth_key: {
    //         select: {
    //           id: true,
    //         },
    //       },
    //     },
    //   },
    // },
    // Remove original S3 url as we use repiping url/[media]/raw
    // Remove authorId as unnecessary
    select: {
      id: true,
      filename: true,
      mimetype: true,
      extension: true,
      created_at: true,
      type: true,
      _count: {
        select: {
          views: true,
        },
      },
      author: {
        // Remove api_key & role for secure purposes
        select: {
          id: true,
          nickname: true,
          avatar_url: true,
          auth_key: {
            select: {
              id: true,
            },
          }
        },
      }
    }
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
    // Increment 1 view by creating a record
    prisma.view
      .create({
        data: {
          uploadId: upload.id,
        },
      })
      .then(resolve)
      .catch(reject);
  });

  return {
    ...upload,
    // Remove _count as unnecessary
    _count: undefined,
    views: upload._count.views,
    author: {
      ...upload.author,
      username: upload?.author.auth_key[0].id.split(":")[1],
      // Instead of providing nested auth_key, provide only username above
      auth_key: undefined,
    },
  };
});
