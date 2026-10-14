-- CreateTable
CREATE TABLE "Playlist" (
    "id" SERIAL NOT NULL,
    "playlistId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cover" TEXT,
    "songCount" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Playlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Playlist_playlistId_key" ON "Playlist"("playlistId");

-- CreateIndex
CREATE INDEX "Playlist_order_idx" ON "Playlist"("order");
