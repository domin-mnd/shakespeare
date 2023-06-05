import { PassThrough, Writable } from "node:stream";
import type VolatileFile from "formidable/VolatileFile";
import type { File } from "formidable";

import { S3Client } from "@aws-sdk/client-s3";
// Although @aws-sdk/client-s3 supports uploads, you need @aws-sdk/lib-storage to support Readable streams.
import { Upload } from "@aws-sdk/lib-storage";

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

export function uploadS3(filename: string): (file?: VolatileFile) => Writable {
  // fileWriteStreamHandler rebinds uploadS3 by adding volatile file to it
  // using classes would be useless because of method rebind, therefore you'd not be able
  // to access "this"
  // Rebinding twice is stupid imho
  return (file) => {
    const body = new PassThrough();

    // VolatileFile type doesn't provide data as here
    const { mimetype, originalFilename } = file as unknown as File;

    const fileExtension = originalFilename?.split(".").pop();

    const upload = new Upload({
      client: client,
      params: {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${filename}.${fileExtension}`,
        ContentType: mimetype ?? undefined,
        // Making the content publicly available after embedding it in img tag
        ACL: "public-read",
        Body: body,
      },
    });

    // Await upload
    new Promise<PassThrough>((resolve) => {
      upload.done().then((data) => {
        // @ts-ignore
        body._readableState.data = data;
        // console.log(body);
        resolve(body);
      });
    });

    return body;
  };
}
