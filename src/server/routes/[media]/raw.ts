import { prisma } from "@/server/libs/database";

export default defineEventHandler(async (event) => {
  const media = getRouterParam(event, "media");

  const url = await prisma.upload.findFirst({
    where: {
      filename: media,
    },
    select: {
      path: true,
      mimetype: true,
    },
  });

  if (!url?.path || !url?.mimetype)
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "File not found.",
    });

  setHeaders(event, {
    "Content-Type": url.mimetype,
    "Cache-Control":
      "public, max-age=63072000, s-maxage=63072000, stale-while-revalidate=86400",
  });

  return sendProxy(event, url.path, {
    sendStream: true,
  });
});
