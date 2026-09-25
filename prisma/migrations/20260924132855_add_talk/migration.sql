-- CreateTable
CREATE TABLE "Talk" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Talk_pkey" PRIMARY KEY ("id")
);
