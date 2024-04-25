-- CreateTable
CREATE TABLE "EncryptedMessage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "message" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uuid" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "EncryptedMessage_uuid_key" ON "EncryptedMessage"("uuid");
