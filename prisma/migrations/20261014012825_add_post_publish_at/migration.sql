-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "publishAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Post_published_publishAt_idx" ON "Post"("published", "publishAt");
