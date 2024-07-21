import { promises as fs } from "node:fs";
import path, { resolve } from "node:path";
import { build } from "korob";
import { FileMigrationProvider, Migrator } from "kysely";
import { db } from "../database";

const MIGRATIONS_FOLDER = "dist/migrations";

migrate();
async function migrate() {
  await build({
    build: {
      entry: ["src/database/migrations"],
      format: ["cjs"],
      outDir: MIGRATIONS_FOLDER,
      clean: true,
      dts: false,
      minify: false,
      sourcemap: false,
      outExtension: () => ({
        dts: ".d.ts",
        js: ".js",
      }),
      target: "node14",
    },
  });
  console.info("Migrations built");

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      migrationFolder: resolve(MIGRATIONS_FOLDER),
      fs,
      path,
    }),
  });

  migrator.migrateToLatest().then(console.info, console.error);
}
