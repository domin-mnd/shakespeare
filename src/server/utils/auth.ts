import type { H3Event } from "h3";

import { db } from "@/database";
import type { Role } from "kysely-codegen";

export enum AuthErrorMessage {
  InvalidCredentials = "Invalid username or password",
  InvalidId = "Invalid user ID",
  InternalError = "Internal error",
  UsernameTaken = "Username is already taken",
}

export class AuthError extends Error {
  constructor(message: AuthErrorMessage) {
    super(message);
    this.name = "AuthError";
  }
}

export interface Session {
  sessionId: string;
  userId: number;
  expiresAt: Date;
}

export async function validate(
  event: H3Event,
): Promise<Session | undefined> {
  const sessionId = getCookie(event, "session");
  if (!sessionId) return;

  const session = await db
    .selectFrom("auth_session")
    .where("id", "=", sessionId)
    .where("expires_at", ">", new Date())
    .selectAll()
    .executeTakeFirst();
  if (!session) return;

  return {
    sessionId: session.id,
    userId: session.user_id,
    expiresAt: session.expires_at,
  };
}

export async function login(
  username: string,
  password: string,
): Promise<Session> {
  const passwordHash = await hash(password);

  const record = await db
    .selectFrom("auth_key")
    .where("username", "=", username)
    .where("hashed_password", "=", passwordHash)
    .selectAll()
    .executeTakeFirst();

  if (!record)
    throw new AuthError(AuthErrorMessage.InvalidCredentials);

  return createSession(record.user_id);
}

interface NewUser {
  username: string;
  password: string;
  nickname?: string;
  avatar_url?: string;
  role?: Role;
}

interface RegisteredUser {
  userId: number;
  apiKey: string;
}

export async function register(
  payload: NewUser,
): Promise<RegisteredUser> {
  const passwordHash = await hash(payload.password);

  const result = await db
    .insertInto("auth_user")
    .values({
      nickname: payload.nickname,
      avatar_url: payload.avatar_url,
      role: payload.role,
    })
    .returning(["id", "api_key"])
    .executeTakeFirst();

  if (result === undefined)
    throw new AuthError(AuthErrorMessage.InternalError);

  const usernameIsTaken = await db
    .selectFrom("auth_key")
    .where("username", "=", payload.username)
    .select("id")
    .executeTakeFirst()
    .then(r => r !== undefined)
    .catch(() => false);

  if (usernameIsTaken)
    throw new AuthError(AuthErrorMessage.UsernameTaken);

  const key = await db
    .insertInto("auth_key")
    .values({
      user_id: result.id,
      username: payload.username,
      hashed_password: passwordHash,
    })
    .returning("id")
    .execute();

  if (key === undefined)
    throw new AuthError(AuthErrorMessage.InternalError);

  return { userId: result.id, apiKey: result.api_key };
}

export async function usersExist(): Promise<boolean> {
  return db
    .selectFrom("auth_user")
    .executeTakeFirst()
    .then(r => r !== undefined)
    .catch(() => false);
}

export async function deleteUser(userId: number) {
  await db
    .deleteFrom("auth_key")
    .where("user_id", "=", userId)
    .execute();
  await db
    .deleteFrom("auth_session")
    .where("user_id", "=", userId)
    .execute();
  await db.deleteFrom("auth_user").where("id", "=", userId).execute();
}

interface UpdatedUser {
  nickname?: string;
  avatar_url?: string;
  role?: Role;
}

export async function updateUser(
  userId: number,
  { nickname, avatar_url, role }: UpdatedUser,
) {
  const result = await db
    .updateTable("auth_user")
    .set({
      nickname,
      avatar_url,
      role,
    })
    .where("id", "=", userId)
    .executeTakeFirst();

  if (result.numUpdatedRows === BigInt(0))
    throw new AuthError(AuthErrorMessage.InvalidId);
}

export async function createSession(
  userId: number,
): Promise<Session> {
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  const result = await db
    .insertInto("auth_session")
    .values({
      user_id: userId,
      expires_at: expiresAt,
    })
    .returning("id")
    .executeTakeFirst();

  if (result === undefined)
    throw new AuthError(AuthErrorMessage.InternalError);

  return {
    sessionId: result.id,
    userId,
    expiresAt,
  };
}

export function setSession(event: H3Event, session: Session) {
  setCookie(event, "session", session.sessionId, {
    expires: session.expiresAt,
    sameSite: "strict",
    secure: true,
    path: "/",
  });
}

export function setApiKey(event: H3Event, apiKey: string) {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  setCookie(event, "api_key", apiKey, {
    expires,
    sameSite: "strict",
    secure: true,
    path: "/",
  });
}

async function hash(password: string): Promise<string> {
  const hashed = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(password),
  );
  return Array.from(new Uint8Array(hashed))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}
