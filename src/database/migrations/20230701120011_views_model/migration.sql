/*
  Warnings:

  - You are about to drop the column `views` on the `upload` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "upload_filename_views_idx";

-- AlterTable
ALTER TABLE "upload" DROP COLUMN "views";

-- CreateTable
CREATE TABLE "View" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadId" INTEGER NOT NULL,

    CONSTRAINT "View_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "upload_filename_idx" ON "upload"("filename");

-- AddForeignKey
ALTER TABLE "View" ADD CONSTRAINT "View_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "upload"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
