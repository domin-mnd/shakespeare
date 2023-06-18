interface State {
  /** User's ID */
  userId: string;
  /** nickname may not be set so it will be null */
  nickname?: string | null;
  /** avatar_url may not be set so it will be null */
  avatar_url?: string | null;
  /** User username taken from auth_key */
  username?: string;
};

export const useUserStore = defineStore("user", {
  state: (): State => ({
    /** User's ID */
    userId: "",
    /** User's nickname */
    nickname: "",
    /** User's avatar URL */
    avatar_url: "",
    /** User's username */
    username: "",
  }),
  actions: {
    /**
     * Sets state from the /api/user endpoint.
     *
     * @param {State} body - Data to be set.
     */
    validate(body: State) {
      this.userId = body.userId;
      this.nickname = body.nickname;
      this.avatar_url = body.avatar_url;
      this.username = body.username;
    },
  },
});

/**
 * @see {@link https://pinia.vuejs.org/cookbook/hot-module-replacement.html HMR}
 */
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
