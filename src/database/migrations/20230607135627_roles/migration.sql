-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- AlterTable
ALTER TABLE "auth_user" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';
