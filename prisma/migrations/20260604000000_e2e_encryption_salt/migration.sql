-- Moves encryption end-to-end: the client now derives the key (PBKDF2) and
-- encrypts with AES-GCM in the browser, storing a per-message `salt`.
--
-- Old rows were encrypted server-side with AES-CBC and cannot be decrypted
-- under the new scheme, so they are removed before the NOT NULL column is added.
DELETE FROM "Message";

-- DropIndex: IVs no longer need to be globally unique (they only need to be
-- unique per key, which random generation guarantees in practice).
DROP INDEX "Message_iv_key";

-- AlterTable
ALTER TABLE "Message" ADD COLUMN "salt" TEXT NOT NULL;
