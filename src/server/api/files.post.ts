import { readFiles } from "h3-formidable";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // No busboy or multer :P
  // Get files & fields via readFiles
  const { fields, files } = await readFiles(event, {
    includeFields: true,
    maxFiles: 1,
  });

  // Checkout apikey, authorization key for every user
  const apikey = getRequestHeader(event, "authorization");

  if (!apikey)
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  
  const user = await prisma.authUser.findUnique({
    where: { api_key: apikey },
  });

  if (!user)
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  
  const file = Array.isArray(files) ? files[0] : files;

  // return await prisma.upload.create({
  //   data: {
  //     ...fields,
  //     ...file,
  //     userId: user.id,
  //   },
  // })
});
