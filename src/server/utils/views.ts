import { db } from "~/database";

export async function increaseViewCount(uploadId: number) {
  await db
    .insertInto("view")
    .values({ upload_id: uploadId, created_at: new Date() })
    .execute();
}
