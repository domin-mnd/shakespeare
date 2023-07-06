/*
  Warnings:

  - You are about to drop the column `slug` on the `upload` table. All the data in the column will be lost.
  - Added the required column `extension` to the `upload` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "upload_slug_key";

-- AlterTable
ALTER TABLE "upload"
RENAME COLUMN "slug" TO "extension";
