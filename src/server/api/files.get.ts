import { prisma } from "@/server/libs/database";

/**
 * ## Get file by filename
 * 
 * Endpoint processes Upload record
 * asynchronously updates the view count
 * & returns expanded ref object
 */
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);
  const filename = url.searchParams.get("filename");

  if (!filename)
    throw createError({ statusCode: 400, statusMessage: "Bad Request: missing required parameter - q" });

  const upload = prisma.upload.findUnique({
    where: { filename },
    include: { author: true },
  });

  const data = await upload;

  if (!data) throw createError({ statusCode: 404, statusMessage: "Not Found" });

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
      ...data.author,
      // Remove api_key & role for secure purposes
      api_key: undefined,
      role: undefined,
    },
  };
});
