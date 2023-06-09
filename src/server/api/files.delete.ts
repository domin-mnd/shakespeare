import { prisma } from "@/server/libs/database";
import { simpleStorageService } from "@/server/libs/storage";

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
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  // Checkout cuid API key, authorization header key for every user
  const apikey = getRequestHeader(event, "authorization");

  if (!apikey)
    throw createError({ statusCode: 401, statusMessage: "Unauthorized: missing apikey authorization header" });

  const user = await prisma.authUser.findUnique({
    where: { api_key: apikey },
    select: { id: true, role: true },
  });

  if (!user)
    throw createError({ statusCode: 401, statusMessage: "Unauthorized: invalid credentials" });

  const filename = body?.filename;

  if (!filename || typeof filename !== "string")
    throw createError({
      statusCode: 400,
      statusMessage:
        "Bad Request: missing required type of filename key in body - string",
    });

  const file = await prisma.upload.findUnique({
    where: { slug: filename },
    select: { authorId: true },
  });

  if (!file)
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found: file not found",
    });

  // Check for permissions
  if (file.authorId !== user.id || user.role !== "ADMIN")
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: missing permissions",
    });

  // S3 instance
  const instance = simpleStorageService(filename);

  // Delete the file
  const deleteResponse = await instance.delete();

  // Returns null if an error occured
  if (!deleteResponse)
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error: deletion error, check console",
    });

  try {
    // I could make it not awaiting the upload
    // but it depends on the database
    await prisma.upload.delete({
      where: { slug: filename },
    });
  } catch (error) {
    console.log(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error: check console",
    });
  }

  return {
    statusCode: 200,
    statusMessage: "OK",
    body: deleteResponse,
  }
});
