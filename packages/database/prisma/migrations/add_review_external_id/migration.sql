-- AlterTable: Add externalId and sentiment to Review model
ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "externalId" TEXT;
ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "sentiment" TEXT;

-- CreateIndex: Unique constraint for deduplication
CREATE UNIQUE INDEX IF NOT EXISTS "Review_tenantId_platform_externalId_key"
ON "Review"("tenantId", "platform", "externalId")
WHERE "externalId" IS NOT NULL;
