-- CreateEnum
CREATE TYPE "AiProvider" AS ENUM ('openai', 'anthropic', 'google', 'local');

-- CreateTable AiModel
CREATE TABLE "AiModel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "provider" TEXT NOT NULL,
    "apiKey" TEXT,
    "baseUrl" TEXT,
    "modelId" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "capabilities" JSONB,
    "config" JSONB,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "callsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable AdvisorMessage
CREATE TABLE "AdvisorMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "aiModelId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "suggestions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "AdvisorMessage_aiModelId_fkey" FOREIGN KEY ("aiModelId") REFERENCES "AiModel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "AiModel_isActive_idx" ON "AiModel"("isActive");
CREATE INDEX "AdvisorMessage_aiModelId_idx" ON "AdvisorMessage"("aiModelId");
CREATE INDEX "AdvisorMessage_domain_idx" ON "AdvisorMessage"("domain");
CREATE INDEX "AdvisorMessage_createdAt_idx" ON "AdvisorMessage"("createdAt");
