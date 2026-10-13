-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "albumId" INTEGER;

-- CreateTable
CREATE TABLE "Album" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "coverPhotoId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Album_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Photo_albumId_idx" ON "Photo"("albumId");

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE SET NULL ON UPDATE CASCADE;
