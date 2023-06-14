/*
  Warnings:

  - Added the required column `type` to the `Upload` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UploadType" AS ENUM ('IMAGE', 'FILE', 'URL', 'TEXT');

-- DropIndex
DROP INDEX "Upload_filename_idx";

-- DropIndex
DROP INDEX "auth_user_api_key_idx";

-- AlterTable
ALTER TABLE "Upload" ADD COLUMN     "type" "UploadType" NOT NULL;

-- CreateIndex
CREATE INDEX "Upload_filename_views_idx" ON "Upload"("filename", "views");

-- CreateIndex
CREATE INDEX "auth_user_api_key_role_idx" ON "auth_user"("api_key", "role");
