/*
  Warnings:

  - A unique constraint covering the columns `[type]` on the table `MessageCounter` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `MessageCounter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MessageCounter" ADD COLUMN     "type" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MessageCounter_type_key" ON "MessageCounter"("type");
