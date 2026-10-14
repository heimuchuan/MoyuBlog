-- CreateTable
CREATE TABLE "GuestbookMessage" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "githubLogin" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestbookMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GuestbookMessage_createdAt_idx" ON "GuestbookMessage"("createdAt");
