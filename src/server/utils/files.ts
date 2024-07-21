import type { H3Event } from "h3";
import { Client } from "minio";
import { db } from "~/database";

// Handle environment variables
// Deconstructing environment variables is not necessary
if (
  !process.env.S3_ENDPOINT ||
  !process.env.S3_ACCESS_KEY_ID ||
  !process.env.S3_SECRET_ACCESS_KEY ||
  !process.env.S3_BUCKET_NAME
) {
  throw "Missing environment variables";
}

const client = new Client({
  endPoint: process.env.S3_ENDPOINT,
  useSSL: true,
  accessKey: process.env.S3_ACCESS_KEY_ID,
  secretKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION,
});

export enum FileErrorMessage {
  FileAlreadyExists = "File already exists.",
}

export class FileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileError";
  }
}

export async function streamFilesToSimpleStorage(
  event: H3Event,
  slug: string,
  userId: number,
): Promise<unknown[]> {
  const form = await readMultipartFormData(event);

  if (!form) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "No form data found.",
    });
  }

  const { filename, type, data } = form[0];

  if (!filename) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "No file name found.",
    });
  }

  if (!type) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "No file type found.",
    });
  }

  const extension = getExtension(filename);

  const newFilename = `${slug}.${extension}`;

  const uploadResponse = client.putObject(
    process.env.S3_BUCKET_NAME as string,
    newFilename,
    data,
    {
      "Content-Type": type,
    },
  );

  const databaseResponse = db
    .insertInto("upload")
    .values({
      filename: slug,
      mimetype: type,
      extension,
      created_at: new Date(),
      path: `${getSimpleStorageURL()}/${newFilename}`,
      author_id: userId,
      type: "FILE",
    })
    .execute();

  return Promise.all([uploadResponse, databaseResponse]);
}

export const deleteFileFromSimpleStorage = async (
  filename: string,
): Promise<true | null> => {
  try {
    await client.removeObject(
      process.env.S3_BUCKET_NAME as string,
      filename,
    );
    return true;
  } catch (error) {
    console.error(error);
    return null;
  }
};
