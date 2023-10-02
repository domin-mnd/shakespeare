import { prisma } from "@/server/libs/database";

/**
 * ## Validate user via lucia-auth
 *
 * Validates the caller user, then returns
 * the userId validated by lucia-auth,
 * also returns whether any users are registered.
 *
 * @see {@link https://github.com/pilcrowOnPaper/lucia/blob/main/examples/nuxt/server/api/user.get.ts Example}
 */
export default defineEventHandler<GetProfileRequest, Promise<GetProfileResponse>>(async (event) => {
  const authRequest = auth.handleRequest(event);
  const { user } = await authRequest.validateUser();

  if (!user?.userId) {
    /**
     * Checks whether any users exist
     * @see {@link https://github.com/prisma/prisma/issues/5022#issuecomment-1033631629 Prisma exists alternative}
     */
    const usersExist = await prisma.authUser
      .findMany({
        select: { id: true }, // this line might not be necessary
        take: 1, // this is the important bit, do not check through all the records
      })
      .then((r) => r.length > 0)
      .catch(() => false);

    return {
      userId: undefined,
      body: {},
      usersExist,
      statusCode: 200,
      statusMessage: "OK",
    };
  }

  const userData = await prisma.authUser.findUnique({
    where: { id: user.userId },
    select: {
      id: true,
      nickname: true,
      avatar_url: true,
      auth_key: {
        take: 1,
        select: {
          id: true,
        },
      },
    },
  });

  // Pretty complicated but this gets username from auth_key,
  // it's stored in id as for example "username:dominnya"
  // so we get dominnya
  const username = userData?.auth_key[0].id.split(":")[1];

  return {
    userId: user?.userId,
    body: {
      nickname: userData?.nickname,
      avatar_url: userData?.avatar_url,
      username,
    },
    // it's obvious that any user exists if userId is returned
    usersExist: true,
    statusCode: 200,
    statusMessage: "OK",
  };
});
