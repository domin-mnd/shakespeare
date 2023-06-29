import { Prisma } from "@prisma/client";
import { prisma } from "@/server/libs/database";
import { ShorteningType } from "@/server/libs/constants";

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
export default defineEventHandler<CreateFileResponse>(async (event) => {
  console.log(1);
  const url = getRequestURL(event);
  const shortenerTypeConfig = url.searchParams.get("type");
  const shortenerLengthConfig = url.searchParams.get("length");
  // Checkout cuid API key, authorization header key for every user
  const apikey = getRequestHeader(event, "authorization");
  const contentType = getRequestHeader(event, "content-type");

  if (!contentType?.includes("multipart/form-data"))
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Non multipart/form-data not allowed.",
    });

  if (!apikey)
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Missing apikey authorization header.",
    });

  const user = await prisma.authUser.findUnique({
    where: { api_key: apikey },
    select: { id: true },
  });

  if (!user)
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Invalid credentials.",
    });

  // Enum type of shortening
  let shorteningType: ShorteningType | string =
    shortenerTypeConfig ?? ShorteningType.Classic;

  // Await the body after the user is validated
  switch (shortenerTypeConfig) {
    case "classic":
      shorteningType = ShorteningType.Classic;
      break;
    case "numbers":
      shorteningType = ShorteningType.Numbers;
      break;
    case "pronounceable":
      shorteningType = ShorteningType.Pronounceable;
  }

  // Define custom filename with custom settings
  const filename = shortener(shorteningType, +(shortenerLengthConfig ?? 4));

  if (!filename)
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Invalid filename.",
    });

  try {
    await streamFilesToSimpleStorage(event, filename, user.id);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (error.code === "P2002") {
        throw createError({
          statusCode: 409,
          statusMessage: "Conflict",
          message:
            "File name already exists in the database, reupload it via the client!",
        });
      }
    } else {
      console.error(error);
      throw createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
        message: "An unknown error has occured. Please consider checking console output for more information."
      });
    }
  }

  // ShareX needs a link to the file
  return `${getRequestProtocol(event)}://${getRequestHost(event)}/${filename}`;
});
