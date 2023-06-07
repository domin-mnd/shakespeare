/// <reference types="lucia-auth" />

declare namespace Lucia {
  type Auth = import("./utils/auth").Auth;
  
  type UserAttributes = {
    nickname?: string;
    avatar_url?: string;
    role: import("@prisma/client").Role;
  };
}
