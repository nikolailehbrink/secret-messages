-- Passwordless messages carry their key in the URL fragment and have no salt.
ALTER TABLE "Message" ALTER COLUMN "salt" DROP NOT NULL;
