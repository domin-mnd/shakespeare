import { db } from "~/database";

/**
 * ## Get files by similar filename
 *
 * Endpoint processes upload record
 * & returns expanded mapped ref object
 */
export default defineEventHandler<
  GetViewsRequest,
  Promise<GetViewsResponse>
>(async event => {
  const { lte, gte, lt, gt, username } = getQuery(event);

  const session = await validate(event);

  if (session === undefined)
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Invalid credentials.",
    });

  let user:
    | {
        id: number;
      }
    | undefined = {
    id: session.userId,
  };

  // Find either profile user or the given user
  if (username) {
    user = await db
      .selectFrom("auth_key")
      .where("username", "=", username)
      .select("user_id as id")
      .executeTakeFirst();
  }

  if (user === undefined)
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "User not found.",
    });

  let query = db
    .selectFrom("view")
    .select(["created_at", "id", "upload_id"])
    .where(
      qb =>
        qb
          .selectFrom("upload")
          .select("upload.author_id")
          .whereRef("upload.id", "=", "view.upload_id")
          .limit(1),
      "=",
      user.id,
    );

  if (lte) query = query.where("created_at", "<=", new Date(lte));
  if (gte) query = query.where("created_at", ">=", new Date(gte));
  if (lt) query = query.where("created_at", "<", new Date(lt));
  if (gt) query = query.where("created_at", ">", new Date(gt));

  return query.execute();
});
