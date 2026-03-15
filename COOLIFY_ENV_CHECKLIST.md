# Coolify Env Checklist

Bu dosya, production deployment icin API ve Web servislerinde gerekli environment degiskenlerini tek yerde toplar.

## 1. API Servisi Zorunlu Degiskenler

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME
JWT_SECRET=VERY_LONG_RANDOM_SECRET
ENCRYPTION_KEY=VERY_LONG_RANDOM_SECRET
```

Aciklama:
- ENCRYPTION_KEY productionda zorunludur.
- ENCRYPTION_KEY sabit kalmalidir. Sonradan degistirilirse daha once sifrelenmis integration credentiallari cozulmeyebilir.
- DATABASE_URL, Coolify icindeki PostgreSQL servisine gidecek sekilde ayarlanmalidir.

## 2. API Servisi Opsiyonel Degiskenler

```env
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
ENABLE_SCHEDULER=false
```

## 3. Web Servisi Zorunlu Degiskenler

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME
NEXTAUTH_URL=https://app.senin-domainin.com
NEXTAUTH_SECRET=VERY_LONG_RANDOM_SECRET
AUTH_URL=https://app.senin-domainin.com
AUTH_SECRET=VERY_LONG_RANDOM_SECRET
NEXT_PUBLIC_API_URL=https://api.senin-domainin.com
```

Aciklama:
- NEXTAUTH_URL ve AUTH_URL ayni olmalidir.
- NEXTAUTH_SECRET ve AUTH_SECRET ayni tutulabilir.
- NEXT_PUBLIC_API_URL tarayicinin erisecegi API URL olmalidir.

## 4. Hemen Kopyala Kullan Secret Uretimi

PowerShell:

```powershell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 } | ForEach-Object { [byte]$_ }))
```

OpenSSL:

```bash
openssl rand -base64 64
```

## 5. Coolify Sonrasi Hızli Dogrulama

1. API health endpoint 200 donuyor mu kontrol et.
2. Web login/register endpointleri 200/201 donuyor mu kontrol et.
3. Marketplace connect akisi gercek credential ile test ediliyor mu kontrol et.
4. Contract probe all endpointi tenant bazinda calisiyor mu kontrol et.

## 6. Bu Reponun Bu Patch Setine Ozel Kritik Not

1. Marketplace tarafi artik fake success donmuyor.
2. Credential eksik/hatali ise acik hata donuyor.
3. Bu nedenle deployment dogru env ile sorunsuz olur, ama yanlis credential varsa davranis artik net fail olarak gorunur.
