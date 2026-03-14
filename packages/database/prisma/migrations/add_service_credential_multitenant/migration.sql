-- CreateEnum: ServiceType (çok kiracılı entegrasyon servis tipleri)
CREATE TYPE "ServiceType" AS ENUM (
  'SHIPPING_ARAS',
  'SHIPPING_YURTICI',
  'SHIPPING_MNG',
  'SHIPPING_PTT',
  'SHIPPING_UPS',
  'SHIPPING_DHL',
  'SHIPPING_FEDEX',
  'SHIPPING_OTHER',
  'PAYMENT_IYZICO',
  'PAYMENT_PAYTR',
  'PAYMENT_PARAM',
  'PAYMENT_STRIPE',
  'PAYMENT_OTHER',
  'EINVOICE_FORIBA',
  'EINVOICE_LOGO',
  'EINVOICE_PARASUT',
  'EINVOICE_EFINANS',
  'EINVOICE_OTHER',
  'SMS_NETGSM',
  'SMS_ILETIMERKEZI',
  'SMS_OTHER',
  'EMAIL_SMTP',
  'EMAIL_SENDGRID',
  'EMAIL_OTHER'
);

-- CreateTable: ServiceCredential (her tenant'ın kendi servis kimlik bilgileri)
CREATE TABLE "ServiceCredential" (
  "id"            TEXT NOT NULL,
  "tenantId"      TEXT NOT NULL,
  "serviceType"   "ServiceType" NOT NULL,
  "label"         TEXT,
  "apiUrl"        TEXT,
  "apiKey"        TEXT,
  "apiSecret"     TEXT,
  "apiExtra"      JSONB,
  "isActive"      BOOLEAN NOT NULL DEFAULT true,
  "isDefault"     BOOLEAN NOT NULL DEFAULT false,
  "lastTestedAt"  TIMESTAMP(3),
  "lastTestOk"    BOOLEAN,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ServiceCredential_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ServiceCredential"
  ADD CONSTRAINT "ServiceCredential_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "ServiceCredential_tenantId_serviceType_idx"
  ON "ServiceCredential"("tenantId", "serviceType");

-- AddColumn: Tenant için webhookSecret (per-tenant webhook imzalama)
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "webhookSecret" TEXT;
