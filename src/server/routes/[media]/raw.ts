import { db } from "~/database";

export default defineEventHandler(async event => {
  const media = getRouterParam(event, "media");

  if (!media)
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "File not found.",
    });

  const url = await db
    .selectFrom("upload")
    .where("filename", "=", media)
    .select(["path", "mimetype"])
    .executeTakeFirst();

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
