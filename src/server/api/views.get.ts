import { prisma } from "@/server/libs/database";

/**
 * ## Get files by similar filename
 *
 * Endpoint processes upload record
 * & returns expanded mapped ref object
 */
export default defineEventHandler<GetViewsResponse>(async (event) => {
  const url = getRequestURL(event);
  // Ranges
  const lte = url.searchParams.get("lte"); // Less than or equal to
  const gte = url.searchParams.get("gte"); // Greater than or equal to
  const lt = url.searchParams.get("lt"); // Less than or equal
  const gt = url.searchParams.get("gt"); // Greater than or equal

  // Checkout cuid API key, authorization header key for every user
  const apikey = getRequestHeader(event, "authorization");

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

  const upload = await prisma.upload.findMany({
    where: {
      authorId: user.id,
      // Date range e.g.
      // lte: "2022-01-30"
      // gte: "2022-01-15"
      created_at: {
        lte: lte ? new Date(lte).toISOString() : undefined,
        gte: gte ? new Date(gte).toISOString() : undefined,
        lt: lt ? new Date(lt).toISOString() : undefined,
        gt: gt ? new Date(gt).toISOString() : undefined,
      }
    },
    select: {
      views: true,
      created_at: true,
    },
  });

  return upload;
});
