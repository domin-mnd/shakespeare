import { type Kysely, sql } from "kysely";

// biome-ignore lint/suspicious/noExplicitAny: unknown database
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createType("role")
    .asEnum(["USER", "ADMIN"])
    .execute();

  await db.schema
    .createTable("auth_user")
    .addColumn("id", "serial", col => col.primaryKey())
    .addColumn("nickname", "text")
    .addColumn("avatar_url", "text")
    .addColumn("role", sql`role`, col =>
      col.notNull().defaultTo("USER"),
    )
    .addColumn("api_key", "text", col =>
      col.unique().notNull().defaultTo(sql`gen_random_uuid()`),
    )
    .execute();

  await db.schema
    .createIndex("auth_user_api_key_role_index")
    .on("auth_user")
    .columns(["api_key", "role"])
    .execute();

  await db.schema
    .createTable("auth_key")
    .addColumn("id", "serial", col => col.primaryKey())
    .addColumn("username", "text", col => col.unique().notNull())
    .addColumn("user_id", "int4", col =>
      col.references("auth_user.id").onDelete("cascade").notNull(),
    )
    .addColumn("hashed_password", "text", col => col.notNull())
    .addColumn("primary_key", "boolean", col =>
      col.notNull().defaultTo(true),
    )
    .execute();

  await db.schema
    .createIndex("auth_key_user_id_index")
    .on("auth_key")
    .column("user_id")
    .execute();

  await db.schema
    .createTable("auth_session")
    .addColumn("id", "text", col =>
      col.unique().defaultTo(sql`gen_random_uuid()`).primaryKey(),
    )
    .addColumn("user_id", "int4", col =>
      col.references("auth_user.id").onDelete("cascade").notNull(),
    )
    .addColumn("expires_at", "timestamp", col => col.notNull())
    .execute();

  await db.schema
    .createIndex("auth_session_user_id_index")
    .on("auth_session")
    .column("user_id")
    .execute();

  await db.schema
    .createType("upload_type")
    .asEnum(["IMAGE", "FILE", "URL", "TEXT"])
    .execute();

  await db.schema
    .createTable("upload")
    .addColumn("id", "serial", col => col.primaryKey())
    .addColumn("filename", "text", col => col.unique().notNull())
    .addColumn("mimetype", "text", col => col.notNull())
    .addColumn("extension", "text", col => col.notNull())
    .addColumn("created_at", "timestamptz", col =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("path", "text", col => col.unique().notNull())
    .addColumn("type", sql`upload_type`, col => col.notNull())
    .addColumn("author_id", "int4", col =>
      col.references("auth_user.id").onDelete("cascade").notNull(),
    )
    .execute();

  await db.schema
    .createIndex("upload_filename_index")
    .on("upload")
    .column("filename")
    .execute();

  await db.schema
    .createTable("view")
    .addColumn("id", "serial", col => col.primaryKey())
    .addColumn("created_at", "timestamptz", col =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn("upload_id", "int4", col =>
      col.references("upload.id").onDelete("cascade").notNull(),
    )
    .execute();
}

// biome-ignore lint/suspicious/noExplicitAny: unknown database
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("view").execute();
  await db.schema.dropTable("upload").execute();
  await db.schema.dropTable("auth_session").execute();
  await db.schema.dropTable("auth_key").execute();
  await db.schema.dropTable("auth_user").execute();
  await db.schema.dropType("role").execute();
  await db.schema.dropType("upload_type").execute();
}
