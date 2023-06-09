/**
 * ### POST `/api/login` success response
 * 
 * @prop {string} username - Permanent username for the user
 * @prop {string} password - User password
 */
interface LoginUserResponse extends DefaultResponse {
  /** Logged in user response */
  body: {
    /** Lucia session for that user */
    session: import("lucia-auth").Session;
    /** User's api_key to save */
    apikey: string;
  }
}

/**
 * ### GET `/api/user` success response
 *
 * @see {@link https://lucia-auth.com/basics/handle-requests?nuxt Handle Requests}
 */
interface GetProfileResponse extends DefaultResponse {
  /** User ID */
  userId?: string;
  body: {
    /** nickname may not be set so it will be null */
    nickname?: string | null;
    /** avatar_url may not be set so it will be null */
    avatar_url?: string | null;
    /** User username taken from auth_key */
    username?: string;
  };
  /** Whether any users exist or not, decides the register page accessability */
  usersExist: boolean;
}

/**
 * ### GET `/api/users` success response
 *
 * @header Authorization
 * @param {string} username - User username (not nickname)
 * @param {string} quantity - Amount of uploads to return from that user, defaults to 15
 */
interface GetUserResponse {
  /** User ID */
  id: string;
  /** User Nickname, can be null */
  nickname: string | null;
  /** User avatar, can be null */
  avatar_url: string | null;
  /** User username */
  username: string;
}

/**
 * ### POST `/api/user` success response
 *
 * @header Authorization
 * @prop {string} username - Permanent username for the user
 * @prop {string} password - User password
 * @prop {string?} nickname - Nickname to assign
 * @prop {string?} avatar_url - Avatar URL to assign
 * @prop {Role?} role - Role to assign - either "ADMIN" or "USER"
 */
interface CreateUserResponse extends DefaultResponse {
  /** New user response */
  body: {
    /** New user ID */
    id: string;
    /** Lucia session for that user */
    session: import("lucia-auth").Session;
    /** User's api_key to save */
    apikey: string;
  };
}

/**
 * ### PUT `/api/user` success response
 *
 * @header Authorization
 * @prop {string} userId - User's ID to delete
 * @prop {string?} nickname - Nickname to change
 * @prop {string?} avatar_url - Avatar URL to change
 * @prop {Role?} role - Role to change - either "ADMIN" or "USER"
 */
interface UpdateUserResponse extends DefaultResponse {
  /** Lucia session for the user */
  session: import("lucia-auth").Session;
}

/**
 * ### DELETE `/api/user` success response
 *
 * @header Authorization
 * @prop {string} userId - User's ID to delete
 */
interface DeleteUserResponse extends DefaultResponse {}
