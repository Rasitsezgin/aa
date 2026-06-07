-- CreateTable
CREATE TABLE "SkuGroup" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "masterSku" TEXT NOT NULL,
    "masterStock" INTEGER NOT NULL DEFAULT 0,
    "variantIds" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkuGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SkuGroup_tenantId_idx" ON "SkuGroup"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "SkuGroup_tenantId_masterSku_key" ON "SkuGroup"("tenantId", "masterSku");

-- AddForeignKey
ALTER TABLE "SkuGroup" ADD CONSTRAINT "SkuGroup_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
