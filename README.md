# 🚀 Pazaryonetimi.com

**Yapay Zeka Destekli, Çoklu Pazaryeri ve E-Ticaret Yönetim Platformu**

[![CI](https://github.com/erogluerdem/pazaryonetimi/actions/workflows/ci.yml/badge.svg)](https://github.com/erogluerdem/pazaryonetimi/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Pazaryonetimi.com, Türkiye ve globaldeki pazaryerleri için geliştirilmiş, kapsamlı ve yapay zeka gücüyle çalışan modern bir e-ticaret yönetim platformudur. En güncel web teknolojileri (NestJS, Next.js, Prisma, PostgreSQL) ile inşa edilmiş olup, e-ticaret süreçlerinizi tek bir merkezden, tam otomatik ve akıllı bir şekilde yönetmenizi sağlar.

---

## ✨ Öne Çıkan Özellikler

- **🌍 Çoklu Pazaryeri Entegrasyonu:** Trendyol, Hepsiburada, Amazon, N11, ÇiçekSepeti ve daha fazlası tek panelde.
- **🤖 Yapay Zeka Destekli Fiyatlandırma:** Rakiplerinizi analiz ederek kârınızı maksimize eden dinamik fiyat optimizasyonu.
- **📦 Gelişmiş Envanter Yönetimi:** Çoklu depo desteği, gerçek zamanlı stok takibi ve tüm pazaryerlerinde anlık senkronizasyon.
- **🔄 Akıllı Sipariş Yönetimi:** Siparişlerin otomatik olarak sisteme düşmesi, durum güncellemeleri ve kargo süreçlerinin takibi.
- **👥 Müşteri Segmentasyonu:** RFM analizi ile müşteri davranışlarını anlama, yaşam boyu değer (LTV) hesaplama.
- **🤝 Affiliate (Satış Ortaklığı) Sistemi:** Komisyon takibi ve referans programı altyapısı.
- **✍️ Yapay Zeka İçerik Optimizasyonu:** Ürün açıklamalarının ve SEO metinlerinin tek tıkla otomatik oluşturulması.
- **📊 Kapsamlı Raporlama:** Planlanmış, otomatik raporlar (PDF/Excel dışa aktarma seçenekleri ile).
- **🌐 Özel Chrome Eklentisi:** Tarayıcı üzerinden doğrudan ürün analizi ve rakip takibi.
- **🕷️ Web Scraping:** Rakiplerin mağaza ve ürün verilerini otomatik olarak toplayan gelişmiş bot altyapısı.

---

## 🏗️ Mimari Yapı

Bu proje, bir **Turborepo** monorepo mimarisi ile tasarlanmıştır.

```text
pazaryonetimi.com/
├── apps/
│   ├── api/           # NestJS Backend API (Port 3001)
│   ├── web/           # Next.js Frontend (Port 3000)
│   └── extension/     # Chrome Eklentisi (Vite + React)
├── packages/
│   └── database/      # Prisma ORM & Veritabanı Şemaları
├── docker-compose.yaml
└── turbo.json
```

---

## 🛠️ Kullanılan Teknolojiler

**Backend (API)**
- **Framework:** NestJS 11.x & TypeScript
- **Veritabanı:** PostgreSQL (Prisma ORM ile)
- **Kuyruk Yönetimi:** BullMQ & Redis
- **Bot/Scraping:** Puppeteer
- **Yapay Zeka:** OpenAI & Google Generative AI entegrasyonları
- **Güvenlik:** JWT tabanlı kimlik doğrulama & 2FA (İki Aşamalı Doğrulama) desteği
- **Dokümantasyon:** Swagger/OpenAPI

**Frontend (Web)**
- **Framework:** Next.js 15.x (App Router mimarisi)
- **Kütüphane:** React 19.x
- **Stil:** Tailwind CSS 4.x
- **Veri Yönetimi:** TanStack Query & Zustand (State Management)
- **Görselleştirme:** Recharts, Fabric.js (Görsel Düzenleme)

**Chrome Eklentisi**
- Vite & React
- Chrome Manifest V3 standartları

**Altyapı & DevOps**
- Docker & Docker Compose
- GitHub Actions ile CI/CD süreçleri
- Coolify ile tek tıkla dağıtım (Deployment)
- Prometheus ile sistem metrikleri takibi

---

## 🚀 Kurulum ve Başlangıç

### Gereksinimler
- Node.js 20 veya üzeri
- PostgreSQL 16
- Redis 7
- npm 10 veya üzeri

### Adım Adım Kurulum

1. **Projeyi klonlayın:**
   ```bash
   git clone https://github.com/erogluerdem/pazaryonetimi.git
   cd pazaryonetimi
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Çevre (Environment) değişkenlerini ayarlayın:**
   `.env.example` dosyasının adını `.env` olarak değiştirin ve kendi veritabanı bilgilerinizi girin.
   ```bash
   cp .env.example .env
   ```

4. **Prisma Client oluşturun:**
   ```bash
   npm run generate
   ```

5. **Geliştirme sunucularını başlatın:**
   ```bash
   npm run dev
   ```

**Sunucular başarıyla başlatıldığında:**
- Web Arayüzü: `http://localhost:3000`
- API Sunucusu: `http://localhost:3001`
- API Dokümantasyonu (Swagger): `http://localhost:3001/api-docs`

---

## 🐳 Docker ile Hızlı Kurulum

Projeyi hiç kurulum yapmadan direkt Docker üzerinden ayağa kaldırabilirsiniz:

```bash
# Tüm servisleri arka planda başlatır
docker-compose up -d

# Logları izlemek için:
docker-compose logs -f api
docker-compose logs -f web
```

---

## 📁 Detaylı Proje Yapısı

### API Modülleri (50+ Modül)
API tarafı mikroservis mimarisine benzer modüler bir yapıda kurgulanmıştır. Bazı kritik modüller:
- `auth`: JWT ve 2FA destekli güvenli giriş.
- `marketplace`: Tüm pazaryerleriyle haberleşen ana köprü.
- `pricing-optimization`: Yapay zeka destekli fiyat motoru.
- `inventory` & `warehouse`: Gelişmiş, çoklu depo stok yönetimi.
- `ai`: Otomatik ürün açıklaması ve SEO oluşturucu.
- `payments`: İyzico vb. ödeme altyapısı.
- `e-invoice`: Otomatik e-fatura kesim işlemleri.

---

## 📦 Canlıya Alma (Deployment)

Proje, **Coolify** üzerinde hızlıca yayınlanmak üzere optimize edilmiştir. 
Detaylı kurulum için:
1. Sunucunuza [Coolify](https://coolify.io) kurun.
2. Bu GitHub reposunu Coolify üzerinden ekleyin.
3. Çevre değişkenlerini (`.env.coolify.example` referansı ile) tanımlayın.
4. `main` dalına push yaptığınız an otomatik CI/CD çalışır.

Manuel Docker Deployment için:
```bash
docker-compose -f docker-compose.prod.yaml build
docker-compose -f docker-compose.prod.yaml up -d
```

---

## 📚 API Dokümantasyonu

Sistemdeki tüm endpoint'leri ve istek detaylarını incelemek için Swagger kullanabilirsiniz:
- **Yerel Geliştirme:** `http://localhost:3001/api-docs`

API token'ınızı, dokümantasyon sayfasındaki yetkilendirme (Authorize) alanına `Bearer <token>` formatında ekleyerek test yapabilirsiniz.

---

## 🤝 Katkıda Bulunma (Contributing)

Geliştirmelere destek olmak isterseniz:
1. Repoyu fork'layın.
2. Yeni bir dal (branch) oluşturun: `git checkout -b ozellik/yeni-fikir`
3. Değişikliklerinizi commit'leyin: `git commit -m 'feat: Yeni fikir eklendi'`
4. Dalınıza push yapın: `git push origin ozellik/yeni-fikir`
5. Bir Pull Request (PR) açın.

---

## 📄 Lisans

Bu proje **MIT Lisansı** ile lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına göz atabilirsiniz.

---

**Made with ❤️ in Istanbul**

[Web Sitesi](https://pazaryonetimi.com) | [Detaylı Proje Tanıtımı](https://erdemeroglu.com.tr/yazilimlar/pazaryonetimi) | [Destek](mailto:support@pazaryonetimi.com)
