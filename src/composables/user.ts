interface State {
  /** User's ID */
  userId: string;
  /** nickname may not be set so it will be null */
  nickname?: string | null;
  /** avatar_url may not be set so it will be null */
  avatar_url?: string | null;
  /** User username taken from auth_key */
  username?: string;
}

export const useUser = () =>
  useState<State>("user", () => ({
    /** User's ID */
    userId: "",
    /** User's nickname */
    nickname: "",
    /** User's avatar URL */
    avatar_url: "",
    /** User's username */
    username: "",
  }));
