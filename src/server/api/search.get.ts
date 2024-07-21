import { jsonArrayFrom } from "kysely/helpers/postgres";
import { db } from "~/database";

/**
 * ## Get files by similar filename
 *
 * Endpoint processes upload record
 * & returns expanded mapped ref object
 */
export default defineEventHandler<
  SearchRequest,
  Promise<SearchResponse>
>(async event => {
  const {
    quantity = 30,
    page = 1,
    filename = "",
    username,
  } = getQuery(event);
  const session = await validate(event);

  if (session === undefined)
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Invalid credentials.",
    });

  const user = await db
    .selectFrom("auth_user")
    .where("id", "=", session.userId)
    .select(({ selectFrom }) => [
      "id",
      "role",
      selectFrom("auth_key")
        .whereRef("auth_key.user_id", "=", "auth_user.id")
        .select("username")
        .as("username"),
    ])
    .executeTakeFirst();

  if (!user)
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Invalid credentials.",
    });

  const userUsername = user.username;

  if (username && username !== userUsername && user.role !== "ADMIN")
    return [];

  // This is horrible
  let query = db
    .selectFrom("upload")
    .orderBy("created_at", "desc")
    .limit(+quantity)
    .where("filename", "like", `%${filename}%`)
    .offset((+page - 1) * +quantity)
    .select(({ selectFrom }) => [
      "created_at",
      "extension",
      "filename",
      "id",
      "mimetype",
      "type",
      selectFrom("view")
        .whereRef("view.upload_id", "=", "upload.id")
        .select(({ fn }) => [fn.count<number>("id").as("views")])
        .as("views"),
      jsonArrayFrom(
        selectFrom("auth_user")
          .whereRef("auth_user.id", "=", "upload.author_id")
          .select(({ selectFrom }) => [
            "id",
            "nickname",
            "avatar_url",
            selectFrom("auth_key")
              .whereRef("auth_key.user_id", "=", "auth_user.id")
              .select("username")
              .as("username"),
          ]),
      ).as("author"),
    ]);

  if (user.role !== "ADMIN")
    query = query.where("author_id", "=", user.id);

  if (username)
    query = query.where(
      qb =>
        qb
          .selectFrom("auth_key")
          .select("auth_key.username")
          .whereRef("auth_key.user_id", "=", "upload.author_id")
          .limit(1),
      "=",
      username,
    );

  const result = await query.execute();

  return result.map<GetFileResponse>(file => ({
    created_at: file.created_at,
    extension: file.extension,
    filename: file.filename,
    id: file.id,
    mimetype: file.mimetype,
    type: file.type,
    views: file.views ?? 0,
    author: {
      id: file.author[0].id,
      avatar_url: file.author[0].avatar_url,
      nickname: file.author[0].nickname,
      username: file.author[0].username as string,
    },
  }));
});
