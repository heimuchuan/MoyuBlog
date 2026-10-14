-- CreateTable
CREATE TABLE "ShowcaseTag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShowcaseTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialLink" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShowcaseTag_order_idx" ON "ShowcaseTag"("order");

-- CreateIndex
CREATE INDEX "SocialLink_order_idx" ON "SocialLink"("order");
