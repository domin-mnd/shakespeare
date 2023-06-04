import { PassThrough, Writable } from "node:stream";
import type VolatileFile from "formidable/VolatileFile";
import type { File } from "formidable";

import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

export type FileWriteStreamHandler = (file?: VolatileFile) => Writable;

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

const client = new S3Client({
  endpoint: `https://${process.env.S3_ENDPOINT}`,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  region: process.env.S3_REGION,
});

export function uploadS3(filename: string, file?: VolatileFile): Writable {
  const body = new PassThrough();

  // VolatileFile type doesn't provide data as here
  const {
    mimetype,
    originalFilename,
  } = file as unknown as File;

  const fileExtension = originalFilename?.split(".").pop();

  new Upload({
    client: client,
    params: {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${filename}.${fileExtension}`,
      ContentType: mimetype ?? undefined,
      ACL: 'public-read',
      Body: body,
    },
  });

  console.log(body);

  return body;
}
