-- AI İçerik Optimizasyonu Tabloları

-- İçerik analiz geçmişi
CREATE TABLE "ContentAnalysis" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" TEXT NOT NULL,
    "productId" TEXT,
    "originalTitle" TEXT NOT NULL,
    "originalDescription" TEXT,
    "platform" TEXT NOT NULL DEFAULT 'TRENDYOL',
    "seoScore" INTEGER NOT NULL DEFAULT 0,
    "readabilityScore" INTEGER NOT NULL DEFAULT 0,
    "keywordScore" INTEGER NOT NULL DEFAULT 0,
    "competitivenessScore" INTEGER NOT NULL DEFAULT 0,
    "overallScore" INTEGER NOT NULL DEFAULT 0,
    "analysisResult" JSONB,
    "suggestions" JSONB,
    "detectedKeywords" JSONB,
    "detectedIssues" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentAnalysis_pkey" PRIMARY KEY ("id")
);

-- İçerik optimizasyon geçmişi (versiyon takibi)
CREATE TABLE "ContentOptimization" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" TEXT NOT NULL,
    "productId" TEXT,
    "analysisId" TEXT,
    "platform" TEXT NOT NULL DEFAULT 'TRENDYOL',
    "version" INTEGER NOT NULL DEFAULT 1,
    "originalTitle" TEXT NOT NULL,
    "originalDescription" TEXT,
    "optimizedTitle" TEXT NOT NULL,
    "optimizedDescription" TEXT,
    "keywords" JSONB,
    "seoScoreBefore" INTEGER NOT NULL DEFAULT 0,
    "seoScoreAfter" INTEGER NOT NULL DEFAULT 0,
    "improvements" JSONB,
    "tone" TEXT NOT NULL DEFAULT 'professional',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "aiModelUsed" TEXT DEFAULT 'gemini-1.5-flash',
    "tokenUsage" INTEGER DEFAULT 0,
    "appliedAt" TIMESTAMP(3),
    "syncedToPlatform" BOOLEAN NOT NULL DEFAULT false,
    "syncResult" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentOptimization_pkey" PRIMARY KEY ("id")
);

-- Toplu optimizasyon işleri
CREATE TABLE "ContentBatchJob" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'TRENDYOL',
    "tone" TEXT NOT NULL DEFAULT 'professional',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalProducts" INTEGER NOT NULL DEFAULT 0,
    "processedProducts" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failCount" INTEGER NOT NULL DEFAULT 0,
    "avgScoreBefore" INTEGER DEFAULT 0,
    "avgScoreAfter" INTEGER DEFAULT 0,
    "config" JSONB,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentBatchJob_pkey" PRIMARY KEY ("id")
);

-- Toplu optimizasyon öğeleri
CREATE TABLE "ContentBatchItem" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "batchJobId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "optimizationId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentBatchItem_pkey" PRIMARY KEY ("id")
);

-- İçerik şablonları
CREATE TABLE "ContentTemplate" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "platform" TEXT,
    "category" TEXT,
    "tone" TEXT NOT NULL DEFAULT 'professional',
    "titleTemplate" TEXT,
    "descriptionTemplate" TEXT,
    "promptTemplate" TEXT,
    "variables" JSONB,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentTemplate_pkey" PRIMARY KEY ("id")
);

-- İçerik kuralları (platform bazlı kural seti)
CREATE TABLE "ContentRule" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "ruleType" TEXT NOT NULL,
    "ruleName" TEXT NOT NULL,
    "ruleValue" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentRule_pkey" PRIMARY KEY ("id")
);

-- Indexler
CREATE INDEX "ContentAnalysis_tenantId_idx" ON "ContentAnalysis"("tenantId");
CREATE INDEX "ContentAnalysis_productId_idx" ON "ContentAnalysis"("productId");
CREATE INDEX "ContentAnalysis_platform_idx" ON "ContentAnalysis"("platform");

CREATE INDEX "ContentOptimization_tenantId_idx" ON "ContentOptimization"("tenantId");
CREATE INDEX "ContentOptimization_productId_idx" ON "ContentOptimization"("productId");
CREATE INDEX "ContentOptimization_status_idx" ON "ContentOptimization"("status");
CREATE INDEX "ContentOptimization_analysisId_idx" ON "ContentOptimization"("analysisId");

CREATE INDEX "ContentBatchJob_tenantId_idx" ON "ContentBatchJob"("tenantId");
CREATE INDEX "ContentBatchJob_status_idx" ON "ContentBatchJob"("status");

CREATE INDEX "ContentBatchItem_batchJobId_idx" ON "ContentBatchItem"("batchJobId");
CREATE INDEX "ContentBatchItem_productId_idx" ON "ContentBatchItem"("productId");

CREATE INDEX "ContentTemplate_tenantId_idx" ON "ContentTemplate"("tenantId");
CREATE INDEX "ContentRule_tenantId_platform_idx" ON "ContentRule"("tenantId", "platform");

-- Foreign Keys
ALTER TABLE "ContentAnalysis" ADD CONSTRAINT "ContentAnalysis_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContentAnalysis" ADD CONSTRAINT "ContentAnalysis_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ContentOptimization" ADD CONSTRAINT "ContentOptimization_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContentOptimization" ADD CONSTRAINT "ContentOptimization_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ContentOptimization" ADD CONSTRAINT "ContentOptimization_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "ContentAnalysis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ContentBatchJob" ADD CONSTRAINT "ContentBatchJob_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContentBatchItem" ADD CONSTRAINT "ContentBatchItem_batchJobId_fkey" FOREIGN KEY ("batchJobId") REFERENCES "ContentBatchJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContentBatchItem" ADD CONSTRAINT "ContentBatchItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContentTemplate" ADD CONSTRAINT "ContentTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContentRule" ADD CONSTRAINT "ContentRule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
