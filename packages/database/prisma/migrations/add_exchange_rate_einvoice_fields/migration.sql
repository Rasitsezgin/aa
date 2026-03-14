-- AlterTable Invoice - Add e-fatura fields
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'SATIS';
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "scenario" TEXT NOT NULL DEFAULT 'TEMEL';
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "buyerTitle" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "buyerTaxNumber" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "buyerTaxOffice" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "buyerAddress" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "buyerCity" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "buyerDistrict" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "buyerEmail" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "sellerTitle" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "sellerTaxNumber" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "sellerTaxOffice" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "subtotal" DECIMAL(65,30);
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "taxAmount" DECIMAL(65,30);
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "totalAmount" DECIMAL(65,30);
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "items" JSONB;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "gibInvoiceId" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "gibEnvelopeId" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "gibStatusCode" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "gibStatusDesc" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "xmlUrl" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "sentAt" TIMESTAMP(3);
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "acceptedAt" TIMESTAMP(3);
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Invoice_gibInvoiceId_idx" ON "Invoice"("gibInvoiceId");

-- CreateTable ExchangeRate
CREATE TABLE IF NOT EXISTS "ExchangeRate" (
    "id" TEXT NOT NULL,
    "baseCurrency" TEXT NOT NULL,
    "targetCurrency" TEXT NOT NULL,
    "rate" DECIMAL(65,30) NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'TCMB',
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ExchangeRate_baseCurrency_targetCurrency_date_key" ON "ExchangeRate"("baseCurrency", "targetCurrency", "date");
CREATE INDEX IF NOT EXISTS "ExchangeRate_baseCurrency_targetCurrency_idx" ON "ExchangeRate"("baseCurrency", "targetCurrency");
CREATE INDEX IF NOT EXISTS "ExchangeRate_date_idx" ON "ExchangeRate"("date");