/*
  Warnings:

  - You are about to drop the column `password` on the `EncryptedMessage` table. All the data in the column will be lost.
  - Made the column `iv` on table `EncryptedMessage` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EncryptedMessage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "message" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uuid" TEXT NOT NULL
);
INSERT INTO "new_EncryptedMessage" ("createdAt", "id", "iv", "message", "uuid") SELECT "createdAt", "id", "iv", "message", "uuid" FROM "EncryptedMessage";
DROP TABLE "EncryptedMessage";
ALTER TABLE "new_EncryptedMessage" RENAME TO "EncryptedMessage";
CREATE UNIQUE INDEX "EncryptedMessage_iv_key" ON "EncryptedMessage"("iv");
CREATE UNIQUE INDEX "EncryptedMessage_uuid_key" ON "EncryptedMessage"("uuid");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
