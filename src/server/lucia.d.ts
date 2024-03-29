/// <reference types="lucia" />

declare namespace Lucia {
  type Auth = import("./utils/auth").Auth;

  type UserAttributes = {
    nickname?: string;
    avatar_url?: string;
    role: "ADMIN" | "USER";
  };
}
