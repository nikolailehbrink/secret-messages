-- CreateTable
CREATE TABLE "MessageCounter" (
    "id" SERIAL NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MessageCounter_pkey" PRIMARY KEY ("id")
);
