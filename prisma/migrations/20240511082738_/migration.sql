/*
  Warnings:

  - You are about to drop the column `isViewed` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "isViewed",
ADD COLUMN     "isDecryptedAndViewed" BOOLEAN NOT NULL DEFAULT false;
