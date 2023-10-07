import { prisma } from "@/server/libs/database";
import { Client } from "minio";
import type { H3Event } from "h3";

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

export async function streamFilesToSimpleStorage(
  event: H3Event,
  slug: string,
  userId: string,
): Promise<any> {
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

  const databaseResponse = prisma.upload.create({
    data: {
      filename: slug,
      mimetype: type,
      extension,
      path: `${getSimpleStorageURL()}/${newFilename}`,
      authorId: userId,
      type: "FILE",
    },
  });

  return Promise.all([uploadResponse, databaseResponse]);
}

export const deleteFileFromSimpleStorage = async (
  filename: string,
): Promise<void | null> => {
  try {
    const response = await client.removeObject(
      process.env.S3_BUCKET_NAME as string,
      filename,
    );
    return response;
  } catch (error) {
    console.error(error);
    return null;
  }
};
