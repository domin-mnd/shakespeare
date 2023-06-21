import { Prisma } from "@prisma/client";
import { prisma } from "@/server/libs/database";
import { shortener, readFiles } from "@/server/utils";
import { ShorteningType } from "@/server/libs/constants";
import { simpleStorageService } from "@/server/libs/storage";

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

  // Upload to S3 instance
  const instance = simpleStorageService(filename);

  // No busboy or multer :P
  // Get files via readFiles wrapper of formidable
  const files = await readFiles(event, {
    maxFiles: 1,
    // No createReadStream because of performance
    // Does not generate temp file even though `files` returns an object with it
    fileWriteStreamHandler: instance.upload,
  });

  // This is actually the action that awaits full upload
  const contents = await instance.contents();

  // If this line returns undefined, then it means upload failed
  if (!("Location" in contents))
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Handled unknown file upload error. ¯\\_(ツ)_/¯",
    });

  // ShareX happen to upload files 1 by 1 and for the sake of type safety separate files
  const file = Array.isArray(files) ? files[0] : files;

  // Getting file extension according to the original file name that was uploaded
  const fileExtension = file.media.originalFilename.split(".").pop();

  try {
    // I could make it not awaiting the upload
    // but it depends on the database
    await prisma.upload.create({
      data: {
        filename,
        mimetype: file.media.mimetype,
        slug: `${filename}.${fileExtension}`,
        size: file.media.size,
        path: contents.Location as string,
        authorId: user.id,
        type: "FILE",
      },
    });
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
      console.log(error);
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
