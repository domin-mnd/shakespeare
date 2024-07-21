import { Kysely, PostgresDialect } from "kysely";
import type { DB } from "kysely-codegen";
import pg from "pg";
const { Pool } = pg;

function validateEnv(
  env: Record<string, string | undefined>,
): env is Record<string, string> {
  return Object.keys(env).every(key => env[key] !== undefined);
}

const env: Record<string, string | undefined> = {
  connectionString: process.env.DATABASE_URL,
};

if (!validateEnv(env)) {
  throw new Error(
    `Please provide the following environment variables: ${Object.keys(
      env,
    ).join(", ")}`,
  );
}

const dialect = new PostgresDialect({
  pool: new Pool({
    ...env,
    max: 10,
  }),
});

export const db = new Kysely<DB>({
  dialect,
});
