/*
  Warnings:

  - You are about to drop the column `name` on the `auth_user` table. All the data in the column will be lost.
  - Added the required column `nickname` to the `auth_user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "auth_user" DROP COLUMN "name",
ADD COLUMN     "nickname" TEXT NOT NULL;
