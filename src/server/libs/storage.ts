import { PassThrough, Writable } from "node:stream";
import type VolatileFile from "formidable/VolatileFile";
import type { File } from "formidable";

import type {
  AbortMultipartUploadCommandOutput,
  CompleteMultipartUploadCommandOutput,
  DeleteObjectCommandOutput,
} from "@aws-sdk/client-s3";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
// Although @aws-sdk/client-s3 supports uploads, you need @aws-sdk/lib-storage to support Readable streams.
import { Upload } from "@aws-sdk/lib-storage";

/** A simplified type for handling file writes */
export type FileWriteStreamHandler = (file?: VolatileFile) => Writable;
/** Results of uploading */
export type Results =
  | AbortMultipartUploadCommandOutput
  | CompleteMultipartUploadCommandOutput;
/** A simplified type for receiving contents of the upload */
export type Contents = () => Promise<Results>;
/** A simplified type for file deletion */
export type Delete = () => Promise<DeleteObjectCommandOutput | null>;
/** A function under which you can upload and call contents from it (for less-request purposes) */
export interface Uploader {
  upload: FileWriteStreamHandler;
  delete: Delete;
  contents: Contents;
}

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

export function simpleStorageService(filename: string): Uploader {
  // The instance of upload to get the file without additional remote calls
  let upload: Upload;
  // fileWriteStreamHandler rebinds uploadS3 by adding volatile file to it
  // using classes would be useless because of method rebind, therefore you'd not be able
  // to access "this"
  // Rebinding twice is stupid imho
  return {
    upload: (file) => {
      const body = new PassThrough();

      // VolatileFile type doesn't provide data as here
      // formidable issue
      const { mimetype, originalFilename } = file as unknown as File;

      const fileExtension = originalFilename?.split(".").pop();

      upload = new Upload({
        client: client,
        params: {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: `${filename}.${fileExtension}`,
          ContentType: mimetype ?? undefined,
          // Making the content publicly available for embedding it in img tag
          ACL: "public-read",
          Body: body,
        },
      });

      // Await upload (does not include the response time from upload())
      // Response time is the same as contents()
      new Promise<PassThrough>((resolve) => {
        upload.done().then(() => {
          resolve(body);
        });
      });

      return body;
    },
    delete: async () => {
      const command = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: filename, // slug
      });

      try {
        const response: DeleteObjectCommandOutput = await client.send(command);
        return response;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    contents: async () => {
      const response = await upload.done();
      return response;
    },
  };
}
