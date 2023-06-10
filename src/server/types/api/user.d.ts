/**
 * ### GET `/api/user` success response
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
  /** User uploads, depends on quantity searchParam */
  uploads: import("@prisma/client").Upload[];
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