import { PrismaClient } from "@prisma/client";

// Keep client away from handler to avoid reinitialization
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);
  const filename = url.searchParams.get("filename");

  if (!filename)
    throw createError({ statusCode: 400, statusMessage: "Bad Request" });

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
    // Add views
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
