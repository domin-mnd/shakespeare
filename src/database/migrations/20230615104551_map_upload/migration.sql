/*
  Warnings:

  - You are about to drop the `Upload` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Upload" DROP CONSTRAINT "Upload_authorId_fkey";

-- DropTable
DROP TABLE "Upload";

-- CreateTable
CREATE TABLE "upload" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "views" INTEGER NOT NULL DEFAULT 0,
    "path" TEXT NOT NULL,
    "type" "UploadType" NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "upload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "upload_filename_key" ON "upload"("filename");

-- CreateIndex
CREATE UNIQUE INDEX "upload_slug_key" ON "upload"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "upload_path_key" ON "upload"("path");

-- CreateIndex
CREATE INDEX "upload_filename_views_idx" ON "upload"("filename", "views");

-- AddForeignKey
ALTER TABLE "upload" ADD CONSTRAINT "upload_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "auth_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
