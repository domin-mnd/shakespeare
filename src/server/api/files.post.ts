import { PrismaClient } from "@prisma/client";
import { shortener, readFiles } from "@/server/utils";
import { FileWriteStreamHandler, uploadS3 } from "@/server/libs/uploader";
import { inspect } from "node:util";

// const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // // Checkout cuid API key, authorization header key for every user
  const apikey = getRequestHeader(event, "authorization");
  const contentType = getRequestHeader(event, "content-type");

  if (!contentType?.includes("multipart/form-data"))
    throw createError({ statusCode: 400, statusMessage: "Bad Request" });

  // if (!apikey)
  //   throw createError({ statusCode: 401, statusMessage: "Unauthorized" });

  // const user = await prisma.authUser.findUnique({
  //   where: { api_key: apikey },
  // });

  // if (!user)
  //   throw createError({ statusCode: 401, statusMessage: "Unauthorized" });

  const filename = shortener(0, 4);

  // No busboy or multer :P
  // Get files via readFiles wrapper of formidable
  const files = await readFiles(event, {
    maxFiles: 1,
    // No createReadStream because of performance
    fileWriteStreamHandler: uploadS3(filename),
  });

  // ShareX happen to upload files 1 by 1 and for the sake of type safety separate files
  const file = Array.isArray(files) ? files[0] : files;

  console.log(inspect(file, false, null, true /* enable colors */))

  // Getting file extension according to the original file name that was uploaded
  // const fileExtension = file.fdata.originalFilename.split(".").pop();

  // await prisma.upload.create({
  //   data: {
  //     filename,
  //     mimetype: file.fdata.mimetype,
  //     slug: `${filename}.${fileExtension}`,
  //     size: file.fdata.size,

  //   },
  // });

  // const { mimetype, size,  } = file;

  // id Int @id @default(autoincrement())

  // filename  String
  // mimetype  String
  // slug      String   @unique
  // size      Int
  // created_at DateTime @default(now()) @map("created_at")
  // views     Int      @default(0)
  // path      String   @unique

  // author   AuthUser @relation(fields: [authorId], references: [id])
  // authorId String
});
