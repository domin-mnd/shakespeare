import { prisma } from "@/server/libs/database";
import { auth } from "@/server/utils/auth";

/**
 * ## Validate user via lucia-auth
 *
 * Validates the caller user, then returns
 * the userId validated by lucia-auth,
 * also returns whether any users are registered.
 *
 * @see {@link https://github.com/pilcrowOnPaper/lucia/blob/main/examples/nuxt/server/api/user.get.ts Example}
 */
export default defineEventHandler<GetUserResponse>(async (event) => {
  const authRequest = auth.handleRequest(event);
  const { user } = await authRequest.validateUser();

  /**
   * Checks whether any users exist
   * @see {@link https://github.com/prisma/prisma/issues/5022#issuecomment-1033631629 Prisma exists alternative}
   */
  const usersExist = await prisma.authUser
    .findMany({
      select: { id: true }, // this line might not be necessary
      take: 1, // this is the important bit, do not check through all the records
    })
    .then((r) => r.length > 0);

  return {
    userId: user?.userId,
    usersExist,
    statusCode: 200,
    statusMessage: "OK",
  };
});
