/*
  Warnings:

  - A unique constraint covering the columns `[filename]` on the table `Upload` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Upload_filename_key" ON "Upload"("filename");

-- CreateIndex
CREATE INDEX "Upload_filename_idx" ON "Upload"("filename");
