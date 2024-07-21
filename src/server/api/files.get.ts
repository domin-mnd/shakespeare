import { db } from "~/database";

/**
 * ## Get file by filename
 *
 * Endpoint processes Upload record
 * asynchronously updates the view count
 * & returns expanded ref object
 */
export default defineEventHandler<
  GetFileRequest,
  Promise<GetFileResponse>
>(async event => {
  const { filename } = getQuery(event);

  if (!filename)
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Missing required parameter - filename.",
    });

  const upload = await db
    .selectFrom("upload")
    .where("filename", "=", filename)
    .select(({ selectFrom, fn }) => [
      "id",
      "author_id",
      "filename",
      "mimetype",
      "extension",
      "created_at",
      "type",
      selectFrom("view")
        .whereRef("upload_id", "=", "upload.id")
        .select(({ fn }) => fn.count<number>("id").as("views"))
        .as("views"),
    ])
    .executeTakeFirst();

  if (!upload)
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "File not found.",
    });

  const author = await db
    .selectFrom("auth_user")
    .where("id", "=", upload?.author_id)
    .select(({ selectFrom }) => [
      "id",
      "nickname",
      "avatar_url",
      selectFrom("auth_key")
        .whereRef("auth_key.user_id", "=", "auth_user.id")
        .select("username")
        .as("username"),
    ])
    .executeTakeFirst();

  if (!author)
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "File not found.",
    });

  increaseViewCount(upload.id);

  return {
    id: upload.id,
    filename: upload.filename,
    mimetype: upload.mimetype,
    extension: upload.extension,
    created_at: upload.created_at,
    type: upload.type,
    views: upload.views ?? 0,
    author: {
      avatar_url: author.avatar_url,
      nickname: author.nickname,
      username: author.username as string,
    },
  };
});
