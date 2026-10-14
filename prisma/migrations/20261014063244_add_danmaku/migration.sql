-- CreateTable
CREATE TABLE "Danmaku" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "top" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dur" INTEGER NOT NULL DEFAULT 18,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Danmaku_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Danmaku_order_idx" ON "Danmaku"("order");
