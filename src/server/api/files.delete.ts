import { db } from "~/database";

/**
 * ## File deletion endpoint.
 *
 * 3 steps for the deletion of the file: `validation`, `file deletion`, `record deletion`
 *
 * - `validation` - Validate if file is valid & user provides correct credentials.
 * API key is indexed, so it shouldn't be slow.
 * - `file deletion` - Delete file from used storage library.
 * - `record deletion` - Delete record in database - SQL-only.
 *
 * @returns {string} Status & the SDK response in body key.
 */
export default defineEventHandler<
  DeleteFileRequest,
  Promise<DeleteFileResponse>
>(async event => {
  const body = await readBody(event);
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
    .select(["id", "role"])
    .executeTakeFirst();

  if (!user)
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Invalid credentials.",
    });

  const filename = body?.filename;

  if (!filename || typeof filename !== "string")
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message:
        "Missing required type of filename key in body - string.",
    });

  const file = await db
    .selectFrom("upload")
    .where("filename", "=", filename)
    .select("author_id")
    .executeTakeFirst();

  if (file === undefined)
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "File not found.",
    });

  // Check for permissions
  if (file.author_id !== user.id || user.role !== "ADMIN")
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Missing permissions.",
    });

  // Delete the file
  const deleteResponse = await deleteFileFromSimpleStorage(filename);

  // Returns null if an error occured
  if (deleteResponse === null)
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message:
        "There was an unknown deletion error, please consider checking your console output.",
    });

  try {
    // I could make it not awaiting the upload
    // but it depends on the database
    await db
      .deleteFrom("upload")
      .where("filename", "=", filename)
      .execute();
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message:
        "An unknown error has occured. Please consider checking console output for more information.",
    });
  }

  return {
    statusCode: 200,
    statusMessage: "OK",
    result: deleteResponse,
  };
});
