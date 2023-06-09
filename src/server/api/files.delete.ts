import { PrismaClient, Prisma } from "@prisma/client";
import { shortener, readFiles } from "@/server/utils";
import { simpleStorageService } from "@/server/libs/storage";

// Keep client away from handler to avoid reinitialization
const prisma = new PrismaClient();

/**
 * ## File upload endpoint.
 *
 * Algorithm divided into 4 parts: `validation`, `upload`, `initialization`, `creation`.
 *
 * - `validation` - Validate if file is valid & user provides correct credentials.
 * API key is indexed, so it shouldn't be slow.
 * - `upload` - Upload process to S3 / Local storage. Is the fastest part as it is asynchronous.
 * - `initialization` - Await the upload instance, then retrieve all needed data for record creation.
 * - `creation` - Create record in database - SQL-only.
 * Can't be done asynchronously because of `initialization` data needed.
 *
 * @returns {string} Link to the file that ShareX needs, won't return any objects or something else.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  // Checkout cuid API key, authorization header key for every user
  const apikey = getRequestHeader(event, "authorization");

  if (!apikey)
    throw createError({ statusCode: 401, statusMessage: "Unauthorized: missing apikey authorization header" });

  const user = await prisma.authUser.findUnique({
    where: { api_key: apikey },
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
