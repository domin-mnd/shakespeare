import { prisma } from "@/server/libs/database";
import type { H3Event } from "h3";
import Busboy from "busboy";
import {
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

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

export async function streamFilesToSimpleStorage(
  event: H3Event,
  filename: string,
  userId: string
): Promise<void> {
  // Await for all chunks & promises to be resolved
  return await new Promise((resolve, reject) => {
    const bb = Busboy({ headers: event.node.req.headers });
    let chunks: any[] = [];
    let fileMimeType: string;
    let fileExtension: string | undefined;

    bb.on(
      "file",
      (_fieldname: string, file: File, filedata: FileData): void => {
        fileMimeType = filedata.mimeType;
        fileExtension = getExtension(filedata.filename);

        file.on("data", (data) => {
          // you will get chunks here will pull all chunk to an array and later concat it.
          chunks.push(data);
        });
      }
    );

    bb.on("finish", async () => {
      const slug = `${filename}.${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: slug,
        Body: Buffer.concat(chunks), // Concatenating all chunks
        ACL: "public-read",
        ContentType: fileMimeType,
      });

      Promise.all([
        client.send(command),
        prisma.upload.create({
          data: {
            filename,
            mimetype: fileMimeType,
            slug,
            path: `${getSimpleStorageURL()}/${slug}`,
            authorId: userId,
            type: "FILE",
          },
        }),
      ])
        .then(() => resolve())
        .catch(reject);
    });

    event.node.req.pipe(bb);
  });
}

export const deleteFileFromSimpleStorage = async (
  filename: string
): Promise<import("@aws-sdk/client-s3").DeleteObjectCommandOutput | null> => {
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
};
