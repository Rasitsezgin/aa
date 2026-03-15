# Marketplace Minimum Credential Check-list

Bu check-list, `marketplace.connect` oncesi minimum credential dogrulamasini standartlastirmak icin hazirlandi.

## 1) Trendyol
- Zorunlu: `apiKey`
- Zorunlu: `apiSecret`
- Zorunlu: `supplierId` (tercihen numerik)
- Not: Test/deger placeholder (`public`, `dummy`, `test`) kullanmayin.

Ornek JSON:
```json
{
  "apiKey": "YOUR_TRENDYOL_API_KEY",
  "apiSecret": "YOUR_TRENDYOL_API_SECRET",
  "supplierId": "203786"
}
```

## 2) Hepsiburada
- Zorunlu: `apiKey`
- Zorunlu: `apiSecret`
- Zorunlu: `merchantId`

Ornek JSON:
```json
{
  "apiKey": "YOUR_HEPSIBURADA_API_KEY",
  "apiSecret": "YOUR_HEPSIBURADA_API_SECRET",
  "merchantId": "123456"
}
```

## 3) N11
- Zorunlu: `apiKey`
- Zorunlu: `apiSecret`

Ornek JSON:
```json
{
  "apiKey": "YOUR_N11_APP_KEY",
  "apiSecret": "YOUR_N11_APP_SECRET"
}
```

## 4) Ciceksepeti
- Zorunlu: `apiKey`
- Zorunlu: `apiSecret`

Ornek JSON:
```json
{
  "apiKey": "YOUR_CICEKSEPETI_API_KEY",
  "apiSecret": "YOUR_CICEKSEPETI_API_SECRET"
}
```

## 5) Amazon
- Zorunlu: `apiKey` (mevcut bridge implementasyonunda sellerRef/seller URL gibi kullaniliyor)
- Zorunlu: `apiSecret` (mevcut bridge implementasyonunda token/secret gibi kullaniliyor)
- Not: SP-API order/stock/price aksiyonlari icin ek entegrasyon gereklidir.

Ornek JSON:
```json
{
  "apiKey": "https://www.amazon.com.tr/s?me=YOUR_SELLER_ID",
  "apiSecret": "YOUR_SP_API_TOKEN_OR_SECRET"
}
```

## CLI Validation Script
Dosya: `apps/api/scripts/marketplace/validate-credentials.ps1`

Kullanim:
```powershell
pwsh ./apps/api/scripts/marketplace/validate-credentials.ps1 \
  -Platform TRENDYOL \
  -CredentialsJson '{"apiKey":"...","apiSecret":"...","supplierId":"203786"}'
```

Strict mode:
```powershell
pwsh ./apps/api/scripts/marketplace/validate-credentials.ps1 \
  -Platform AMAZON \
  -CredentialsJson '{"apiKey":"seller","apiSecret":"token"}' \
  -Strict
```
