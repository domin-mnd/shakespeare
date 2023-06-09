import { prisma } from "@/server/libs/database";

/**
 * ## Get file by filename
 * 
 * Endpoint processes upload record
 * asynchronously updates the view count
 * & returns expanded ref object
 */
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);
  const filename = url.searchParams.get("q");

  if (!filename)
    throw createError({ statusCode: 400, statusMessage: "Bad Request: missing required parameter - q" });

  const upload = prisma.upload.findUnique({
    where: { filename },
  });

  const data = await upload;

  if (!data) throw createError({ statusCode: 404, statusMessage: "Not Found" });

  const author = await upload.author();

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
        where: { id: data.id },
      })
      .then(resolve)
      .catch(reject);
  });

  return {
    ...data,
    // Remove authorId as unnecessary
    authorId: undefined,
    author: {
      ...author,
      // Remove api_key for secure purposes
      api_key: undefined,
    },
  };
});
