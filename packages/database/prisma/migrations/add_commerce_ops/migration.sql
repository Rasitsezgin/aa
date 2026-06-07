-- Commerce Ops: Bundle, Stock Alerts, BuyBox

CREATE TABLE IF NOT EXISTS "ProductBundle" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "pricingType" TEXT NOT NULL DEFAULT 'percentage_off',
    "pricingValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "originalTotal" DECIMAL(12,2),
    "finalPrice" DECIMAL(12,2),
    "platforms" JSONB,
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductBundle_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ProductBundleItem" (
    "id" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductBundleItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "StockAlertRule" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "productId" TEXT,
    "criticalLevel" INTEGER NOT NULL DEFAULT 5,
    "reorderLevel" INTEGER NOT NULL DEFAULT 10,
    "autoPauseListing" BOOLEAN NOT NULL DEFAULT false,
    "syncAllChannels" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastTriggeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockAlertRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BuyBoxRule" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "productId" TEXT,
    "platform" "Platform" NOT NULL,
    "minMarginPct" DECIMAL(5,2) NOT NULL DEFAULT 10,
    "maxDropPct" DECIMAL(5,2) NOT NULL DEFAULT 5,
    "competitorFloor" DECIMAL(12,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuyBoxRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BuyBoxSnapshot" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "ourPrice" DECIMAL(12,2) NOT NULL,
    "competitorPrice" DECIMAL(12,2),
    "hasBuyBox" BOOLEAN NOT NULL DEFAULT false,
    "rank" INTEGER,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuyBoxSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ProductBundle_tenantId_sku_key" ON "ProductBundle"("tenantId", "sku");
CREATE INDEX IF NOT EXISTS "ProductBundle_tenantId_idx" ON "ProductBundle"("tenantId");
CREATE INDEX IF NOT EXISTS "ProductBundle_status_idx" ON "ProductBundle"("status");

CREATE INDEX IF NOT EXISTS "ProductBundleItem_bundleId_idx" ON "ProductBundleItem"("bundleId");
CREATE INDEX IF NOT EXISTS "ProductBundleItem_productId_idx" ON "ProductBundleItem"("productId");

CREATE INDEX IF NOT EXISTS "StockAlertRule_tenantId_idx" ON "StockAlertRule"("tenantId");
CREATE INDEX IF NOT EXISTS "StockAlertRule_productId_idx" ON "StockAlertRule"("productId");

CREATE INDEX IF NOT EXISTS "BuyBoxRule_tenantId_platform_idx" ON "BuyBoxRule"("tenantId", "platform");

CREATE INDEX IF NOT EXISTS "BuyBoxSnapshot_tenantId_productId_platform_idx" ON "BuyBoxSnapshot"("tenantId", "productId", "platform");
CREATE INDEX IF NOT EXISTS "BuyBoxSnapshot_capturedAt_idx" ON "BuyBoxSnapshot"("capturedAt");

ALTER TABLE "ProductBundle" DROP CONSTRAINT IF EXISTS "ProductBundle_tenantId_fkey";
ALTER TABLE "ProductBundle" ADD CONSTRAINT "ProductBundle_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProductBundleItem" DROP CONSTRAINT IF EXISTS "ProductBundleItem_bundleId_fkey";
ALTER TABLE "ProductBundleItem" ADD CONSTRAINT "ProductBundleItem_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "ProductBundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProductBundleItem" DROP CONSTRAINT IF EXISTS "ProductBundleItem_productId_fkey";
ALTER TABLE "ProductBundleItem" ADD CONSTRAINT "ProductBundleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StockAlertRule" DROP CONSTRAINT IF EXISTS "StockAlertRule_tenantId_fkey";
ALTER TABLE "StockAlertRule" ADD CONSTRAINT "StockAlertRule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StockAlertRule" DROP CONSTRAINT IF EXISTS "StockAlertRule_productId_fkey";
ALTER TABLE "StockAlertRule" ADD CONSTRAINT "StockAlertRule_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BuyBoxRule" DROP CONSTRAINT IF EXISTS "BuyBoxRule_tenantId_fkey";
ALTER TABLE "BuyBoxRule" ADD CONSTRAINT "BuyBoxRule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BuyBoxRule" DROP CONSTRAINT IF EXISTS "BuyBoxRule_productId_fkey";
ALTER TABLE "BuyBoxRule" ADD CONSTRAINT "BuyBoxRule_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "BuyBoxSnapshot" DROP CONSTRAINT IF EXISTS "BuyBoxSnapshot_tenantId_fkey";
ALTER TABLE "BuyBoxSnapshot" ADD CONSTRAINT "BuyBoxSnapshot_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BuyBoxSnapshot" DROP CONSTRAINT IF EXISTS "BuyBoxSnapshot_productId_fkey";
ALTER TABLE "BuyBoxSnapshot" ADD CONSTRAINT "BuyBoxSnapshot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
