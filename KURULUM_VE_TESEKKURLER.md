# 🎁 Pazaryonetimi.com — Teşekkürler & Hızlı Kurulum Kılavuzu

**Merhaba Değerli Meslektaşım,**

Aylarca üzerinde büyük bir emek ve titizlikle çalıştığımız, Türkiye'nin ve dünyanın önde gelen e-ticaret pazaryerlerini (Trendyol, Hepsiburada, Amazon, N11, ÇiçekSepeti) tek merkezden yöneten yapay zeka destekli SaaS platformumuz **Pazaryonetimi.com**'un kaynak kodlarına hoş geldin!

Bu projeyi, kurumsal B2B ve ERP projelerimizin yoğunluğu sebebiyle açık kaynak topluluğuna ve girişimci meslektaşlarımıza **tamamen ücretsiz ve tam sürüm** olarak armağan ediyoruz. Amacımız; bu kıymetli altyapının arşivlerde beklemesi yerine, senin gibi yetenekli bir meslektaşımızın elinde hayat bulması, portföyüne değer katması veya doğrudan kendi e-ticaret SaaS girişiminin temelini oluşturmasıdır.

---

## 🏗️ Proje Mimarisi (Monorepo - Turborepo)

```
pazaryonetimi.com/
├── apps/
│   ├── api/           # NestJS 11 Backend API & 50+ Modül (Port 3001)
│   ├── web/           # Next.js 15 App Router & Tailwind CSS 4 Frontend (Port 3000)
│   └── extension/     # Chrome Uzantısı (Manifest V3 - Rakip Fiyat Analizi)
├── packages/
│   └── database/      # Prisma ORM & PostgreSQL Veritabanı Şeması
├── docker-compose.yaml # Tek komutla prod/dev ayağa kaldırma
└── turbo.json         # Yüksek hızlı monorepo yapılandırması
```

---

## 🚀 1. Yöntem: Docker ile 2 Dakikada Ayağa Kaldırma (Önerilen)

Sistemde PostgreSQL, Redis, NestJS API ve Next.js Web servisleri hazır Docker Compose konfigürasyonu ile yapılandırılmıştır.

```bash
# 1. Örnek ortam değişkenlerini kopyalayın
cp .env.example .env

# 2. Tüm servisleri arka planda derleyip başlatın
docker-compose up -d --build
```

Servisler ayağa kalktıktan sonra:
* 🌐 **Web Arayüzü (Dashboard & Landing):** `http://localhost:3000`
* 🔌 **Backend API:** `http://localhost:3001`
* 📚 **Swagger API Dokümantasyonu:** `http://localhost:3001/api-docs`
* 🐘 **PostgreSQL:** `localhost:5432`
* ⚡ **Redis:** `localhost:6379`

---

## 💻 2. Yöntem: Yerel Geliştirme Ortamında Çalıştırma (Manual)

### Gereksinimler:
* Node.js >= 20.x
* PostgreSQL 16
* Redis 7
* npm >= 10.x

### Adım Adım Kurulum:

```bash
# 1. Bağımlılıkları yükleyin
npm install

# 2. Ortam dosyasını oluşturun
cp .env.example .env
# .env dosyası içerisindeki DATABASE_URL, REDIS_HOST, JWT_SECRET değerlerini düzenleyin.

# 3. Prisma veritabanı şemasını oluşturun
npm run generate

# 4. Veritabanı tablolarını içeri aktarın
cd packages/database
npx prisma db push
cd ../..

# 5. Tüm servisleri (API + Web) tek komutla başlatın
npm run dev
```

---

## 🧩 Chrome Uzantısını (Extension) Yükleme

`apps/extension` klasöründe pazar yerlerindeki ürünleri gezerken anlık rakip analizi ve fiyat karşılaştırması yapan Chrome eklentisi yer almaktadır:

1. Uzantıyı derleyin:
   ```bash
   cd apps/extension
   npm run build
   ```
2. Google Chrome tarayıcınızda `chrome://extensions` adresine gidin.
3. Sağ üstteki **Geliştirici Modu (Developer mode)** anahtarını açın.
4. **Paketlenmemiş öğe yükle (Load unpacked)** butonuna basarak `apps/extension/dist` klasörünü seçin.

---

## 🔑 Desteklenen Pazaryeri Entegrasyonları

Backend (`apps/api/src/modules/marketplace`) altında her pazaryeri için hazır API adaptörleri bulunur:
* **Trendyol API:** Ürün aktarımı, stok/fiyat güncelleme, sipariş ve kargo barkodu
* **Hepsiburada API:** Merchant API entegrasyonu ve sipariş onaylama
* **Amazon SP-API:** Selling Partner API (FBA & FBM)
* **N11 API:** SOAP & REST servis köprüleri
* **ÇiçekSepeti API:** Ürün ve sipariş senkronizasyonu
* **E-Fatura & Muhasebe:** GİB e-arşiv, Paraşüt, BizimHesap köprüleri
* **Kargo Entegrasyonu:** Yurtiçi, Aras, MNG, Sürat Kargo API modelleri

---

## 🎁 pazaryonetimi.com Alan Adı Hediyesi

Bu projenin tescilli jenerik alan adı olan **pazaryonetimi.com**'u; bu projeyi gerçekten yayına alacak, geliştirecek veya SaaS olarak işletecek **bir meslektaşımıza hiçbir ücret talep etmeden tamamen hediye edeceğiz.**

R10 forum konumuza projeyi nasıl değerlendireceğini veya iyi niyet mesajını yazarak bu hediye değerlendirmesine katılabilirsin.

---

## 💬 İletişim ve Destek

Projeyi geliştirirken takıldığın teknik bir detay, mimari soru veya fikir olursa bana dilediğin zaman ulaşabilirsin:

* 🌐 **Web:** [https://erdemeroglu.com.tr](https://erdemeroglu.com.tr)
* 🐙 **GitHub:** [https://github.com/erogluerdem](https://github.com/erogluerdem)
* 💼 **LinkedIn:** [https://linkedin.com/in/erogluerdem](https://linkedin.com/in/erogluerdem)
* ✉️ **E-posta:** dev@erdemeroglu.com.tr

Projeyi güle güle kullanman, harika başarılara ve bol kazançlı bir SaaS girişimine dönüştürmen dileğiyle!

**Erdem Eroğlu**  
*Full Stack Yazılım & Sistem Mimarı*
