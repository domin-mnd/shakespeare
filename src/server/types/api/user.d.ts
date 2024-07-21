/**
 * ### POST `/api/login` request
 */
interface LoginUserRequest extends DefaultResponse {
  body: {
    /** Permanent username for the user. */
    username?: string;
    /** User password. */
    password?: string;
  };
}

/**
 * ### POST `/api/login` success response
 */
interface LoginUserResponse extends DefaultResponse {
  /** Logged in user response */
  body: {
    /** Session for that user */
    session: Session;
    /** User's api_key to save */
    apikey: string;
  };
}

/**
 * ### GET `/api/profile` request
 */
interface GetProfileRequest {}

/**
 * ### GET `/api/profile` success response
 */
interface GetProfileResponse extends DefaultResponse {
  /** User ID */
  userId?: number;
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
 * ### GET `/api/users` request
 *
 * @header Authorization
 */
interface GetUserRequest {
  query: {
    /** User username (not nickname). */
    username?: string;
    /** Amount of uploads to return from that user, defaults to 15 */
    quantity?: number;
  };
}

/**
 * ### GET `/api/users` success response
 */
interface GetUserResponse {
  /** User ID */
  id: number;
  /** User Nickname, can be null */
  nickname: string | null;
  /** User avatar, can be null */
  avatar_url: string | null;
  /** User username */
  username: string;
}

/**
 * ### POST `/api/user` request
 *
 * @header Authorization
 */
interface CreateUserRequest {
  body: {
    /** Permanent username for the user. */
    username?: string;
    /** User password. */
    password?: string;
    /** Nickname to assign. */
    nickname?: string;
    /** Avatar URL to assign. */
    avatar_url?: string;
    /** Role to assign - either "ADMIN" or "USER". */
    role?: "ADMIN" | "USER";
  };
}

/**
 * ### POST `/api/user` success response
 */
interface CreateUserResponse extends DefaultResponse {
  /** New user response */
  body: {
    /** New user ID */
    id: number;
    /** Session for that user */
    session: Session;
    /** User's api_key to save */
    apikey: string;
  };
}

/**
 * ### PUT `/api/user` request
 *
 * @header Authorization
 */
interface UpdateUserRequest {
  body: {
    /** User's ID to delete. */
    userId?: number;
    /** Nickname to change. */
    nickname?: string;
    /** Avatar URL to change. */
    avatar_url?: string;
    /** Role to change - either "ADMIN" or "USER". */
    role?: "ADMIN" | "USER";
  };
}

/**
 * ### PUT `/api/user` success response
 */
interface UpdateUserResponse extends DefaultResponse {}

/**
 * ### DELETE `/api/user` request
 *
 * @header Authorization
 */
interface DeleteUserRequest {
  body: {
    /** User's ID to delete. */
    userId?: number;
  };
}

/**
 * ### DELETE `/api/user` success response
 */
interface DeleteUserResponse extends DefaultResponse {}
