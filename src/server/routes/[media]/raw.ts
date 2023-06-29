import { prisma } from "@/server/libs/database";
import { get } from "node:https";

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

  setHeader(event, "Content-Type", url.mimetype);

  // sendStream alternative with node:https get
  await new Promise((resolve, reject) => {
    get(url.path, (stream) => {
      stream.pipe(event.node.res);
      stream.on("end", resolve);
      stream.on("error", (error) => reject(createError(error)));
    });
  });
});
