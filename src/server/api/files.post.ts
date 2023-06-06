import { PrismaClient, Prisma } from "@prisma/client";
import { shortener, readFiles } from "@/server/utils";
import { uploadS3 } from "@/server/libs/uploader";

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
 * - `initialization` - Await the upload instance, then retrieve all needed data for row creation.
 * - `creation` - Create row in database - SQL-only.
 * Can't be done asynchronously because of `initialization` data needed.
 * 
 * @returns {string} Link to the file that ShareX needs, won't return any objects or something else.
 */
export default defineEventHandler(async (event) => {
  // Checkout cuid API key, authorization header key for every user
  const apikey = getRequestHeader(event, "authorization");
  const contentType = getRequestHeader(event, "content-type");

  if (!contentType?.includes("multipart/form-data"))
    throw createError({ statusCode: 400, statusMessage: "Bad Request" });

  if (!apikey)
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });

  const user = await prisma.authUser.findUnique({
    where: { api_key: apikey },
  });

  if (!user)
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });

  // Define custom filename with custom settings
  const filename = shortener(0, 4);

  // Upload to S3 instance
  const instance = uploadS3(filename);

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
      statusMessage: "Handled File Upload Error",
    });

  // ShareX happen to upload files 1 by 1 and for the sake of type safety separate files
  const file = Array.isArray(files) ? files[0] : files;

  // Getting file extension according to the original file name that was uploaded
  const fileExtension = file.fdata.originalFilename.split(".").pop();

  try {
    // I could make it not awaiting the upload
    // but it depends on the database
    await prisma.upload.create({
      data: {
        filename,
        mimetype: file.fdata.mimetype,
        slug: `${filename}.${fileExtension}`,
        size: file.fdata.size,
        path: contents.Location as string,
        authorId: user.id,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (error.code === "P2002") {
        throw createError({
          statusCode: 400,
          statusMessage: "The file already exists in the database, reupload it via the client!",
        });
      }
    } else {
      throw createError({
        statusCode: 500,
        statusMessage: "Handled File Creation Error",
      })
    }
  }

  // ShareX needs a link to the file
  return `https://${getRequestHost(event)}/${filename}`;
});
