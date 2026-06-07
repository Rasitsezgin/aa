import { PrismaClient, Plan, UserType, Platform, OrderStatus, PaymentStatus } from '../generated/client';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;

const prisma = new PrismaClient({
  ...(pool ? { adapter: new PrismaPg(pool as any) } : {}),
});

// ============================================================================
// GERÇEK TÜRK E-TİCARET SEED DATA
// ============================================================================

const PRODUCTS = [
  { title: 'Apple iPhone 15 Pro Max 256GB', sku: 'APL-IP15PM-256', barcode: '8901234567890', price: 64999.99, stock: 45, category: 'Elektronik', brand: 'Apple', desc: 'Apple iPhone 15 Pro Max 256GB Doğal Titanyum. A17 Pro çip, 48MP kamera sistemi, Titanium tasarım.' },
  { title: 'Samsung Galaxy S24 Ultra 512GB', sku: 'SAM-S24U-512', barcode: '8901234567891', price: 57999.99, stock: 32, category: 'Elektronik', brand: 'Samsung', desc: 'Samsung Galaxy S24 Ultra 512GB Titanium Gray. Galaxy AI, 200MP kamera, S Pen dahil.' },
  { title: 'Sony WH-1000XM5 Bluetooth Kulaklık', sku: 'SNY-WH1000XM5', barcode: '8901234567892', price: 8499.99, stock: 78, category: 'Elektronik', brand: 'Sony', desc: 'Sony WH-1000XM5 kablosuz gürültü önleyici kulaklık. 30 saat pil ömrü, LDAC codec desteği.' },
  { title: 'Apple MacBook Air M3 16GB 512GB', sku: 'APL-MBA-M3-512', barcode: '8901234567893', price: 42999.99, stock: 18, category: 'Bilgisayar', brand: 'Apple', desc: 'Apple MacBook Air 15 inç M3 çip, 16GB RAM, 512GB SSD. 18 saat pil ömrü.' },
  { title: 'Dyson V15 Detect Absolute Süpürge', sku: 'DYS-V15-ABS', barcode: '8901234567894', price: 18999.99, stock: 25, category: 'Ev & Yaşam', brand: 'Dyson', desc: 'Dyson V15 Detect Absolute kablosuz süpürge. Lazer toz algılama, LCD ekran, 60 dk çalışma.' },
  { title: 'Nike Air Max 270 React Spor Ayakkabı', sku: 'NK-AM270R-42', barcode: '8901234567895', price: 3299.99, stock: 120, category: 'Moda', brand: 'Nike', desc: 'Nike Air Max 270 React erkek spor ayakkabı. Air Max yastıklama, React köpük taban.' },
  { title: 'Philips Airfryer XXL HD9860', sku: 'PHL-AF-XXL', barcode: '8901234567896', price: 6999.99, stock: 55, category: 'Ev & Yaşam', brand: 'Philips', desc: 'Philips Airfryer XXL Premium HD9860. 1.4kg kapasite, akıllı sensör, NutriU uygulaması.' },
  { title: 'Adidas Ultraboost Light Koşu Ayakkabı', sku: 'ADI-UBL-43', barcode: '8901234567897', price: 4199.99, stock: 88, category: 'Moda', brand: 'Adidas', desc: 'Adidas Ultraboost Light koşu ayakkabısı. Light BOOST orta taban, Continental kauçuk dış taban.' },
  { title: 'Apple AirPods Pro 2 USB-C', sku: 'APL-APP2-USBC', barcode: '8901234567898', price: 7499.99, stock: 62, category: 'Elektronik', brand: 'Apple', desc: 'Apple AirPods Pro 2. nesil USB-C. Aktif gürültü önleme, uyarlanabilir ses, kişisel uzamsal ses.' },
  { title: 'Samsung 65" QN90C Neo QLED 4K TV', sku: 'SAM-QN90C-65', barcode: '8901234567899', price: 39999.99, stock: 12, category: 'Elektronik', brand: 'Samsung', desc: 'Samsung 65 inç QN90C Neo QLED 4K Smart TV. Neural Quantum İşlemci, Dolby Atmos.' },
  { title: 'Lego Star Wars Millennium Falcon 75375', sku: 'LGO-SW-75375', barcode: '8901234567900', price: 3999.99, stock: 35, category: 'Oyuncak', brand: 'Lego', desc: 'Lego Star Wars Millennium Falcon 75375. 921 parça, mini figürler dahil.' },
  { title: 'Tommy Hilfiger Erkek Polo Tişört', sku: 'TH-POLO-M', barcode: '8901234567901', price: 1899.99, stock: 150, category: 'Moda', brand: 'Tommy Hilfiger', desc: 'Tommy Hilfiger slim fit polo tişört. %100 pamuk, regular fit kesim.' },
  { title: 'Karaca Hatır Hüps Türk Kahve Makinesi', sku: 'KRC-HH-KAHVE', barcode: '8901234567902', price: 1299.99, stock: 200, category: 'Ev & Yaşam', brand: 'Karaca', desc: 'Karaca Hatır Hüps sütlü Türk kahve makinesi. 5 fincan kapasite, otomatik kapanma.' },
  { title: 'Xiaomi Redmi Note 13 Pro 256GB', sku: 'XM-RN13P-256', barcode: '8901234567903', price: 11999.99, stock: 95, category: 'Elektronik', brand: 'Xiaomi', desc: 'Xiaomi Redmi Note 13 Pro 256GB. 200MP kamera, AMOLED ekran, 67W hızlı şarj.' },
  { title: 'Bosch Serie 6 Bulaşık Makinesi', sku: 'BSH-S6-BM', barcode: '8901234567904', price: 16999.99, stock: 8, category: 'Beyaz Eşya', brand: 'Bosch', desc: 'Bosch Serie 6 tam boyut bulaşık makinesi. PerfectDry, AquaStop, Home Connect.' },
  { title: 'Under Armour Project Rock BSR 3', sku: 'UA-PR-BSR3', barcode: '8901234567905', price: 3799.99, stock: 42, category: 'Moda', brand: 'Under Armour', desc: 'Under Armour Project Rock BSR 3 antrenman ayakkabısı. TriBase taban, UA HOVR yastıklama.' },
  { title: 'Apple Watch Ultra 2 49mm', sku: 'APL-AWU2-49', barcode: '8901234567906', price: 27999.99, stock: 22, category: 'Elektronik', brand: 'Apple', desc: 'Apple Watch Ultra 2 49mm Titanyum kasa. S9 SiP, çift frekanslı GPS, 36 saat pil.' },
  { title: 'De\'Longhi Magnifica S ECAM', sku: 'DLG-MAG-S', barcode: '8901234567907', price: 14999.99, stock: 15, category: 'Ev & Yaşam', brand: 'De\'Longhi', desc: 'De\'Longhi Magnifica S otomatik espresso makinesi. Çekirdekten fincana 60 saniye.' },
  { title: 'JBL Charge 5 Bluetooth Hoparlör', sku: 'JBL-CHG5-BLK', barcode: '8901234567908', price: 3999.99, stock: 68, category: 'Elektronik', brand: 'JBL', desc: 'JBL Charge 5 taşınabilir Bluetooth hoparlör. IP67, 20 saat pil, Powerbank özelliği.' },
  { title: 'Tefal Ingenio Expertise Tava Seti', sku: 'TFL-ING-SET', barcode: '8901234567909', price: 2499.99, stock: 110, category: 'Ev & Yaşam', brand: 'Tefal', desc: 'Tefal Ingenio Expertise 8 parça tava seti. Titanium Excellence kaplama, çıkarılabilir sap.' },
  { title: 'Canon EOS R50 18-45mm Kit', sku: 'CAN-R50-KIT', barcode: '8901234567910', price: 24999.99, stock: 10, category: 'Elektronik', brand: 'Canon', desc: 'Canon EOS R50 aynasız fotoğraf makinesi + RF-S 18-45mm lens. 4K video, 24.2MP.' },
  { title: 'Skechers Go Walk 7 Yürüyüş Ayakkabı', sku: 'SKC-GW7-41', barcode: '8901234567911', price: 2199.99, stock: 175, category: 'Moda', brand: 'Skechers', desc: 'Skechers Go Walk 7 erkek yürüyüş ayakkabısı. Ultra Go yastıklama, slip-on tasarım.' },
  { title: 'iRobot Roomba j7+ Robot Süpürge', sku: 'IRB-J7P-SUP', barcode: '8901234567912', price: 19999.99, stock: 14, category: 'Ev & Yaşam', brand: 'iRobot', desc: 'iRobot Roomba j7+ robot süpürge. PrecisionVision navigasyon, otomatik boşaltma ünitesi.' },
  { title: 'Mavi Jeans Jake Slim Fit Erkek', sku: 'MV-JAKE-32', barcode: '8901234567913', price: 899.99, stock: 220, category: 'Moda', brand: 'Mavi', desc: 'Mavi Jake slim straight erkek jean pantolon. Premium denim, rahat kesim.' },
  { title: 'LG 27" UltraGear OLED Gaming Monitör', sku: 'LG-27GR95QE', barcode: '8901234567914', price: 22999.99, stock: 16, category: 'Bilgisayar', brand: 'LG', desc: 'LG 27GR95QE UltraGear OLED gaming monitör. 240Hz, 0.03ms, QHD çözünürlük, G-Sync.' },
];

const CUSTOMERS = [
  { name: 'Zeynep Kaya', email: 'zeynep.kaya@mail.com', phone: '05321234567' },
  { name: 'Mert Karaca', email: 'mert.karaca@mail.com', phone: '05339876543' },
  { name: 'Selin Aydın', email: 'selin.aydin@mail.com', phone: '05441234567' },
  { name: 'Can Gümüş', email: 'can.gumus@mail.com', phone: '05551234567' },
  { name: 'Elif Demir', email: 'elif.demir@mail.com', phone: '05061234567' },
  { name: 'Ahmet Yılmaz', email: 'ahmet.yilmaz@mail.com', phone: '05371234567' },
  { name: 'Ayşe Çelik', email: 'ayse.celik@mail.com', phone: '05421234567' },
  { name: 'Burak Özkan', email: 'burak.ozkan@mail.com', phone: '05381234567' },
  { name: 'Fatma Şahin', email: 'fatma.sahin@mail.com', phone: '05451234567' },
  { name: 'Ali Koç', email: 'ali.koc@mail.com', phone: '05461234567' },
  { name: 'Merve Aksoy', email: 'merve.aksoy@mail.com', phone: '05471234567' },
  { name: 'Emre Yıldız', email: 'emre.yildiz@mail.com', phone: '05481234567' },
  { name: 'Deniz Akyüz', email: 'deniz.akyuz@mail.com', phone: '05491234567' },
  { name: 'Hakan Erdoğan', email: 'hakan.erdogan@mail.com', phone: '05501234567' },
  { name: 'Gizem Toprak', email: 'gizem.toprak@mail.com', phone: '05511234567' },
];

const ADDRESSES = [
  'Kadıköy, İstanbul', 'Beşiktaş, İstanbul', 'Çankaya, Ankara', 'Bornova, İzmir',
  'Nilüfer, Bursa', 'Muratpaşa, Antalya', 'Selçuklu, Konya', 'Seyhan, Adana',
  'Şahinbey, Gaziantep', 'Atakum, Samsun', 'Yıldırım, Bursa', 'Üsküdar, İstanbul',
  'Mamak, Ankara', 'Karşıyaka, İzmir', 'Konyaaltı, Antalya',
];

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log('🚀 Kapsamlı Seed Data oluşturuluyor...\n');

  const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@pazaryonetimi.com';
  const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'PazarYonetimi2024!';
  const USER_EMAIL = process.env.SEED_USER_EMAIL || 'operator@pazaryonetimi.com';
  const TENANT_NAME = process.env.SEED_TENANT_NAME || 'PazarYönetimi';
  const TENANT_SLUG = process.env.SEED_TENANT_SLUG || 'pazaryonetimi';
  const TENANT_DOMAIN = process.env.SEED_TENANT_DOMAIN || 'app.pazaryonetimi.com';

  // ==================== 1. TENANT ====================
  const tenant = await prisma.tenant.upsert({
    where: { slug: TENANT_SLUG },
    update: {
      name: TENANT_NAME,
      plan: Plan.PRO,
      isOnboarded: true,
      taxOffice: process.env.SEED_TAX_OFFICE || 'Kadıköy',
      taxNumber: process.env.SEED_TAX_NUMBER || '',
      companyType: 'Limited',
      address: process.env.SEED_ADDRESS || '',
      city: process.env.SEED_CITY || 'İstanbul',
      district: process.env.SEED_DISTRICT || '',
      postcode: process.env.SEED_POSTCODE || '',
      phone: process.env.SEED_PHONE || '',
    },
    create: {
      name: TENANT_NAME,
      slug: TENANT_SLUG,
      domain: TENANT_DOMAIN,
      plan: Plan.PRO,
      isOnboarded: true,
      taxOffice: process.env.SEED_TAX_OFFICE || 'Kadıköy',
      taxNumber: process.env.SEED_TAX_NUMBER || '',
      companyType: 'Limited',
      address: process.env.SEED_ADDRESS || '',
      city: process.env.SEED_CITY || 'İstanbul',
      district: process.env.SEED_DISTRICT || '',
      postcode: process.env.SEED_POSTCODE || '',
      phone: process.env.SEED_PHONE || '',
    },
  });
  console.log(`✅ Tenant: ${tenant.name} (${tenant.id})`);

  // ==================== 2. USERS ====================
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { password: hashedPassword, type: UserType.ADMIN, tenantId: tenant.id },
    create: {
      email: ADMIN_EMAIL,
      password: hashedPassword,
      firstName: process.env.SEED_ADMIN_FIRST_NAME || 'Admin',
      lastName: process.env.SEED_ADMIN_LAST_NAME || 'Yönetici',
      type: UserType.ADMIN,
      tenantId: tenant.id,
    },
  });

  await prisma.user.upsert({
    where: { email: USER_EMAIL },
    update: { password: hashedPassword, type: UserType.USER, tenantId: tenant.id },
    create: {
      email: USER_EMAIL,
      password: hashedPassword,
      firstName: process.env.SEED_USER_FIRST_NAME || 'Operatör',
      lastName: process.env.SEED_USER_LAST_NAME || 'Kullanıcı',
      type: UserType.USER,
      tenantId: tenant.id,
    },
  });
  console.log(`✅ Kullanıcılar oluşturuldu`);

  // ==================== 3. INTEGRATIONS ====================
  const platforms: Platform[] = [Platform.TRENDYOL, Platform.HEPSIBURADA, Platform.AMAZON, Platform.N11];
  const integrations: any[] = [];

  for (const platform of platforms) {
    const existing = await prisma.integration.findFirst({
      where: { tenantId: tenant.id, platform },
    });

    if (existing) {
      integrations.push(existing);
    } else {
      const platformLower = platform.toLowerCase();
      const apiKey = process.env[`${platform}_API_KEY`] || `${platformLower}_api_key_REPLACE_ME`;
      const apiSecret = process.env[`${platform}_API_SECRET`] || `${platformLower}_secret_REPLACE_ME`;
      const merchantId = process.env[`${platform}_MERCHANT_ID`] || `MERCHANT_${platform}_REPLACE_ME`;
      const integration = await prisma.integration.create({
        data: {
          tenantId: tenant.id,
          platform,
          apiKey,
          apiSecret,
          apiExtra: { merchantId },
          isActive: platform !== Platform.N11,
        },
      });
      integrations.push(integration);
    }
  }
  console.log(`✅ ${integrations.length} platform entegrasyonu`);

  // ==================== 4. PRODUCTS ====================
  const existingProducts = await prisma.product.findMany({ where: { tenantId: tenant.id } });

  let products: any[] = existingProducts;

  if (existingProducts.length < 10) {
    // Clear and recreate
    if (existingProducts.length > 0) {
      await prisma.orderItem.deleteMany({ where: { order: { tenantId: tenant.id } } });
      await prisma.order.deleteMany({ where: { tenantId: tenant.id } });
      await prisma.image.deleteMany({ where: { product: { tenantId: tenant.id } } });
      await prisma.inventoryLog.deleteMany({ where: { product: { tenantId: tenant.id } } });
      await prisma.marketplaceProduct.deleteMany({ where: { product: { tenantId: tenant.id } } });
      await prisma.product.deleteMany({ where: { tenantId: tenant.id } });
    }

    products = [];
    for (const p of PRODUCTS) {
      const product = await prisma.product.create({
        data: {
          tenantId: tenant.id,
          title: p.title,
          description: p.desc,
          sku: p.sku,
          barcode: p.barcode,
          price: p.price,
          stock: p.stock,
          category: p.category,
          brand: p.brand,
        },
      });

      // Add image
      await prisma.image.create({
        data: {
          productId: product.id,
          url: `https://picsum.photos/seed/${p.sku}/400/400`,
          isMain: true,
          altText: p.title,
        },
      });

      products.push(product);
    }
    console.log(`✅ ${products.length} ürün oluşturuldu`);
  } else {
    console.log(`✅ ${products.length} mevcut ürün kullanılıyor`);
  }

  // ==================== 5. MARKETPLACE PRODUCTS ====================
  const existingMP = await prisma.marketplaceProduct.count({ where: { product: { tenantId: tenant.id } } });

  if (existingMP < 10) {
    for (const product of products) {
      // Her ürün 2-3 platformda
      const numPlatforms = Math.floor(Math.random() * 2) + 2;
      const shuffled = [...platforms].sort(() => Math.random() - 0.5).slice(0, numPlatforms);

      for (const platform of shuffled) {
        const priceVariation = Number(product.price) * (1 + (Math.random() * 0.1 - 0.05));
        try {
          await prisma.marketplaceProduct.create({
            data: {
              productId: product.id,
              marketplaceListingId: product.id,
              platform,
              status: Math.random() > 0.1 ? 'ACTIVE' : 'BLOCKED',
              stock: product.stock + Math.floor(Math.random() * 20 - 10),
              price: Math.round(priceVariation * 100) / 100,
            },
          });
        } catch { }
      }
    }
    console.log(`✅ Marketplace ürün bağlantıları oluşturuldu`);
  }

  // ==================== 6. ORDERS ====================
  const existingOrders = await prisma.order.count({ where: { tenantId: tenant.id } });

  if (existingOrders < 10) {
    const statuses: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.RETURNED];
    const paymentStatuses: PaymentStatus[] = [PaymentStatus.PAID, PaymentStatus.UNPAID, PaymentStatus.REFUNDED];

    // Son 90 günde 150 sipariş
    for (let i = 0; i < 150; i++) {
      const customer = randomItem(CUSTOMERS);
      const platform = randomItem(platforms);
      const orderDate = randomDate(new Date(Date.now() - 90 * 86400000), new Date());
      const numItems = Math.floor(Math.random() * 3) + 1;
      const orderProducts = [...products].sort(() => Math.random() - 0.5).slice(0, numItems);

      let totalAmount = 0;
      const itemsData: any[] = [];

      for (const p of orderProducts) {
        const qty = Math.floor(Math.random() * 3) + 1;
        const unitPrice = Number(p.price);
        const taxRate = 20;
        const discount = Math.random() > 0.7 ? Math.floor(unitPrice * 0.1) : 0;
        totalAmount += (unitPrice * qty) - discount;

        itemsData.push({
          productId: p.id,
          sku: p.sku,
          title: p.title,
          quantity: qty,
          unitPrice,
          taxRate,
          discountAmount: discount,
        });
      }

      const taxAmount = totalAmount * 0.2;
      const shippingCost = totalAmount > 500 ? 0 : Math.floor(Math.random() * 30) + 15;
      // Status: older orders more likely delivered
      const daysSinceOrder = (Date.now() - orderDate.getTime()) / 86400000;
      let status: OrderStatus;
      if (daysSinceOrder > 14) {
        status = Math.random() > 0.05 ? OrderStatus.DELIVERED : OrderStatus.RETURNED;
      } else if (daysSinceOrder > 7) {
        status = Math.random() > 0.2 ? OrderStatus.DELIVERED : OrderStatus.SHIPPED;
      } else if (daysSinceOrder > 3) {
        status = randomItem([OrderStatus.SHIPPED, OrderStatus.CONFIRMED]);
      } else {
        status = randomItem([OrderStatus.PENDING, OrderStatus.CONFIRMED]);
      }

      let paymentStatus: PaymentStatus;
      if (status === OrderStatus.RETURNED) {
        paymentStatus = PaymentStatus.REFUNDED;
      } else if (status === OrderStatus.CANCELLED) {
        paymentStatus = PaymentStatus.UNPAID;
      } else {
        paymentStatus = PaymentStatus.PAID;
      }

      const commissionRate = 0.12 + Math.random() * 0.08; // %12-20
      const commissionAmount = totalAmount * commissionRate;
      const productCost = totalAmount * 0.45; // %45 maliyet
      const netProfit = totalAmount - commissionAmount - productCost - shippingCost;

      const order = await prisma.order.create({
        data: {
          tenantId: tenant.id,
          platform,
          marketplaceOrderId: `MKT-${platform.slice(0, 3)}-${100000 + i}`,
          status,
          paymentStatus,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          shippingAddress: randomItem(ADDRESSES),
          totalAmount: Math.round(totalAmount * 100) / 100,
          taxAmount: Math.round(taxAmount * 100) / 100,
          shippingCost,
          commissionAmount: Math.round(commissionAmount * 100) / 100,
          netProfit: Math.round(netProfit * 100) / 100,
          orderDate,
          items: {
            create: itemsData,
          },
        },
      });
    }
    console.log(`✅ 150 sipariş oluşturuldu`);
  } else {
    console.log(`✅ ${existingOrders} mevcut sipariş kullanılıyor`);
  }

  // ==================== 7. INVENTORY LOGS ====================
  const existingLogs = await prisma.inventoryLog.count();
  if (existingLogs < 10) {
    for (const product of products.slice(0, 15)) {
      const numLogs = Math.floor(Math.random() * 8) + 3;
      for (let j = 0; j < numLogs; j++) {
        const types = ['SALE', 'RESTOCK', 'RETURN', 'ADJUSTMENT'];
        const type = randomItem(types);
        const change = type === 'SALE' ? -(Math.floor(Math.random() * 5) + 1) :
          type === 'RESTOCK' ? Math.floor(Math.random() * 50) + 10 :
            type === 'RETURN' ? Math.floor(Math.random() * 3) + 1 :
              Math.floor(Math.random() * 10) - 5;

        await prisma.inventoryLog.create({
          data: {
            productId: product.id,
            change,
            type,
            description: type === 'SALE' ? `Satış - ${randomItem(platforms)}` :
              type === 'RESTOCK' ? 'Tedarikçiden stok girişi' :
                type === 'RETURN' ? 'Müşteri iadesi' : 'Manuel stok düzeltmesi',
            createdAt: randomDate(new Date(Date.now() - 60 * 86400000), new Date()),
          },
        });
      }
    }
    console.log(`✅ Stok hareketleri oluşturuldu`);
  }

  // ==================== 8. COMPETITORS ====================
  const existingCompetitors = await prisma.competitor.count({ where: { tenantId: tenant.id } });
  if (existingCompetitors < 3) {
    const competitorData = [
      { name: 'ElektroNet', platform: Platform.TRENDYOL, storeUrl: 'https://www.trendyol.com/magaza/elektronet', rating: 4.6, reviewCount: 15420 },
      { name: 'TechMart TR', platform: Platform.HEPSIBURADA, storeUrl: 'https://www.hepsiburada.com/magaza/techmart', rating: 4.3, reviewCount: 8750 },
      { name: 'DigitalCorner', platform: Platform.AMAZON, storeUrl: 'https://www.amazon.com.tr/sp?seller=ABC123', rating: 4.5, reviewCount: 12300 },
      { name: 'ModaPlus', platform: Platform.TRENDYOL, storeUrl: 'https://www.trendyol.com/magaza/modaplus', rating: 4.2, reviewCount: 22100 },
    ];

    for (const c of competitorData) {
      const competitor = await prisma.competitor.create({
        data: {
          tenantId: tenant.id,
          name: c.name,
          platform: c.platform,
          storeUrl: c.storeUrl,
          rating: c.rating,
          reviewCount: c.reviewCount,
        },
      });

      // Her rakibe 5-8 ürün
      const numProducts = Math.floor(Math.random() * 4) + 5;
      for (let j = 0; j < numProducts; j++) {
        const baseProduct = randomItem(products);
        const compPrice = Number(baseProduct.price) * (0.85 + Math.random() * 0.3);

        const cprod = await prisma.competitorProduct.create({
          data: {
            competitorId: competitor.id,
            productId: baseProduct.id,
            marketplaceId: `MKT-${competitor.id.slice(0, 4)}-${j}`,
            url: `${c.storeUrl}/product-${j}`,
            title: baseProduct.title,
            price: Math.round(compPrice * 100) / 100,
            stock: Math.floor(Math.random() * 100) + 10,
            rating: 3.5 + Math.random() * 1.5,
            reviewCount: Math.floor(Math.random() * 500) + 10,
          },
        });

        // Price history for each competitor product
        for (let d = 30; d >= 0; d--) {
          const histPrice = compPrice * (0.95 + Math.random() * 0.1);
          await prisma.priceHistory.create({
            data: {
              tenantId: tenant.id,
              productId: baseProduct.id,
              competitorProductId: cprod.id,
              price: Math.round(histPrice * 100) / 100,
              platform: c.platform,
              createdAt: new Date(Date.now() - d * 86400000),
            },
          });
        }
      }
    }
    console.log(`✅ 4 rakip ve ürünleri oluşturuldu`);
  }

  // ==================== 9. ACTIVITY LOGS ====================
  const existingActivity = await prisma.activityLog.count();
  if (existingActivity < 10) {
    const actions = [
      { action: 'product.created', resource: 'product', details: { message: 'Yeni ürün eklendi' } },
      { action: 'product.updated', resource: 'product', details: { message: 'Ürün fiyatı güncellendi' } },
      { action: 'order.received', resource: 'order', details: { message: 'Yeni sipariş alındı' } },
      { action: 'order.shipped', resource: 'order', details: { message: 'Sipariş kargoya verildi' } },
      { action: 'stock.updated', resource: 'inventory', details: { message: 'Stok güncellendi' } },
      { action: 'stock.alert', resource: 'inventory', details: { message: 'Düşük stok uyarısı' } },
      { action: 'integration.synced', resource: 'integration', details: { message: 'Pazaryeri senkronizasyonu tamamlandı' } },
      { action: 'user.login', resource: 'user', details: { message: 'Kullanıcı giriş yaptı' } },
      { action: 'settings.updated', resource: 'settings', details: { message: 'Mağaza ayarları güncellendi' } },
      { action: 'report.generated', resource: 'report', details: { message: 'Haftalık rapor oluşturuldu' } },
      { action: 'campaign.created', resource: 'campaign', details: { message: 'Yeni kampanya oluşturuldu' } },
      { action: 'review.replied', resource: 'review', details: { message: 'Müşteri yorumuna yanıt verildi' } },
    ];

    for (let i = 0; i < 50; i++) {
      const act = randomItem(actions);
      const resourceProduct = randomItem(products);
      await prisma.activityLog.create({
        data: {
          tenantId: tenant.id,
          userId: admin.id,
          action: act.action,
          resource: act.resource,
          resourceId: resourceProduct.id,
          details: act.details,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          createdAt: randomDate(new Date(Date.now() - 30 * 86400000), new Date()),
        },
      });
    }
    console.log(`✅ 50 aktivite logu oluşturuldu`);
  }

  // ==================== 10. SUPPORT TICKETS ====================
  const existingTickets = await prisma.supportTicket.count({ where: { tenantId: tenant.id } });
  if (existingTickets < 5) {
    const ticketSubjects = [
      'Ürün hasarlı geldi',
      'Kargo gecikmesi hakkında',
      'Yanlış ürün gönderilmiş',
      'İade talebi',
      'Fatura düzeltmesi',
      'Ürün değişimi istiyorum',
      'Eksik parça var',
      'Bedel iadesi istiyorum',
    ];
    const ticketStatuses = ['OPEN', 'PENDING', 'RESOLVED', 'CLOSED'];

    for (let i = 0; i < 12; i++) {
      const customer = randomItem(CUSTOMERS);
      await prisma.supportTicket.create({
        data: {
          tenantId: tenant.id,
          platform: randomItem(platforms),
          subject: randomItem(ticketSubjects),
          status: randomItem(ticketStatuses),
          priority: randomItem(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
          customerName: customer.name,
          customerEmail: customer.email,
          createdAt: randomDate(new Date(Date.now() - 30 * 86400000), new Date()),
        },
      });
    }
    console.log(`✅ 12 destek talebi oluşturuldu`);
  }

  // ==================== 11. COMMISSION RULES ====================
  const existingCommissions = await prisma.marketplaceCommission.count();
  if (existingCommissions < 4) {
    const commissions = [
      { platform: Platform.TRENDYOL, category: 'Elektronik', rate: 12.5, fee: 2.50 },
      { platform: Platform.TRENDYOL, category: 'Moda', rate: 18.0, fee: 1.50 },
      { platform: Platform.TRENDYOL, category: 'Ev & Yaşam', rate: 15.0, fee: 2.00 },
      { platform: Platform.HEPSIBURADA, category: 'Elektronik', rate: 11.0, fee: 3.00 },
      { platform: Platform.HEPSIBURADA, category: 'Moda', rate: 16.5, fee: 1.00 },
      { platform: Platform.AMAZON, category: 'Elektronik', rate: 8.0, fee: 5.00 },
      { platform: Platform.AMAZON, category: 'Moda', rate: 15.0, fee: 2.50 },
      { platform: Platform.N11, category: 'Elektronik', rate: 14.0, fee: 2.00 },
    ];

    for (const c of commissions) {
      try {
        await prisma.marketplaceCommission.create({
          data: {
            platform: c.platform,
            category: c.category,
            commissionRate: c.rate,
            fixedFee: c.fee,
          },
        });
      } catch { }
    }
    console.log(`✅ Komisyon kuralları oluşturuldu`);
  }

  // ==================== 12. SALES FORECASTS ====================
  const existingForecasts = await prisma.salesForecast.count({ where: { tenantId: tenant.id } });
  if (existingForecasts < 10) {
    for (const product of products.slice(0, 10)) {
      for (let d = 1; d <= 30; d++) {
        const date = new Date(Date.now() + d * 86400000);
        await prisma.salesForecast.create({
          data: {
            tenantId: tenant.id,
            productId: product.id,
            forecastDate: date,
            predictedSales: Math.floor(Math.random() * 20) + 2,
            confidenceScore: 0.7 + Math.random() * 0.25,
            metadata: { seasonal: d > 20, trend: 'up' },
          },
        });
      }
    }
    console.log(`✅ Satış tahminleri oluşturuldu`);
  }

  console.log('\n🎉 Seed tamamlandı! Dashboard artık gerçek verilerle çalışacak.\n');

  // ==================== 13. WEBHOOKS ====================
  const existingWebhooks = await prisma.webhook.count({ where: { tenantId: tenant.id } });
  if (existingWebhooks === 0) {
    const webhookData = [
      { name: 'Sipariş Bildirimi', url: 'https://hooks.example.com/orders', events: ['order.created', 'order.updated', 'order.shipped'], isActive: true, successCount: 142, failCount: 3 },
      { name: 'Stok Uyarısı', url: 'https://hooks.example.com/inventory', events: ['inventory.low', 'inventory.updated'], isActive: true, successCount: 89, failCount: 1 },
      { name: 'Ödeme Webhook', url: 'https://hooks.example.com/payments', events: ['payment.received', 'payment.refunded'], isActive: false, successCount: 56, failCount: 8 },
    ];
    for (const wh of webhookData) {
      await prisma.webhook.create({ data: { tenantId: tenant.id, ...wh, secret: `whsec_${Math.random().toString(36).substr(2, 24)}` } });
    }
    console.log('✅ Webhooks oluşturuldu');
  }

  // ==================== 14. AUTOMATIONS ====================
  const existingAutomations = await prisma.automation.count({ where: { tenantId: tenant.id } });
  if (existingAutomations === 0) {
    const automationData = [
      { name: 'Düşük Stok Uyarısı', description: 'Stok 5 altına düştüğünde bildirim gönder', type: 'stock-alert', trigger: 'inventory.low', action: 'notification.send', conditions: { threshold: 5 }, isActive: true, runCount: 34, successRate: 97.1 },
      { name: 'Sipariş Onay E-postası', description: 'Yeni sipariş geldiğinde müşteriye e-posta gönder', type: 'order-process', trigger: 'order.created', action: 'email.send', conditions: { template: 'order_confirmation' }, isActive: true, runCount: 256, successRate: 99.2 },
      { name: 'Fiyat Güncelleme', description: 'Rakip fiyat değiştiğinde otomatik güncelle', type: 'price-adjust', trigger: 'competitor.price_change', action: 'product.update_price', conditions: { margin: 5 }, isActive: false, runCount: 12, successRate: 91.7 },
      { name: 'Günlük Rapor', description: 'Her gün saat 09:00\'da satış raporu e-postala', type: 'report-schedule', trigger: 'schedule.daily', action: 'report.generate', conditions: { time: '09:00', reportType: 'daily_sales' }, isActive: true, runCount: 90, successRate: 100 },
    ];
    for (const auto of automationData) {
      await prisma.automation.create({ data: { tenantId: tenant.id, ...auto } });
    }
    console.log('✅ Otomasyonlar oluşturuldu');
  }

  // ==================== 15. CAMPAIGNS ====================
  const existingCampaigns = await prisma.campaign.count({ where: { tenantId: tenant.id } });
  if (existingCampaigns === 0) {
    const campaignData = [
      { name: 'Yaz İndirimi', description: 'Tüm elektronik ürünlerde %15 indirim', type: 'discount', status: 'active', platforms: ['TRENDYOL', 'HEPSIBURADA'], discount: 15, budget: 50000, spent: 32000, revenue: 185000, impressions: 245000, clicks: 18500, conversions: 920, roas: 5.78, ctr: 7.55, conversionRate: 4.97 },
      { name: 'Flash Sale Cuma', description: 'Her Cuma 18:00-21:00 arası flash indirimler', type: 'flash_sale', status: 'active', platforms: ['TRENDYOL', 'N11'], discount: 25, budget: 20000, spent: 14500, revenue: 98000, impressions: 120000, clicks: 9600, conversions: 480, roas: 6.76, ctr: 8.0, conversionRate: 5.0 },
      { name: 'Kozmetik Bundle', description: 'Kozmetik ürünlerde 3 al 2 öde', type: 'bundle', status: 'completed', platforms: ['HEPSIBURADA'], discount: 33, budget: 15000, spent: 15000, revenue: 67000, impressions: 85000, clicks: 5100, conversions: 340, roas: 4.47, ctr: 6.0, conversionRate: 6.67 },
      { name: 'Ücretsiz Kargo Haftası', description: 'Tüm siparişlerde ücretsiz kargo', type: 'free_shipping', status: 'draft', platforms: ['AMAZON', 'TRENDYOL', 'HEPSIBURADA'], discount: 0, budget: 30000, spent: 0, revenue: 0, impressions: 0, clicks: 0, conversions: 0, roas: 0, ctr: 0, conversionRate: 0 },
    ];
    for (const camp of campaignData) {
      await prisma.campaign.create({
        data: {
          tenantId: tenant.id,
          ...camp,
          startDate: new Date(Date.now() - 15 * 86400000),
          endDate: new Date(Date.now() + 15 * 86400000),
        },
      });
    }
    console.log('✅ Kampanyalar oluşturuldu');
  }

  // ==================== 16. REVIEWS ====================
  const existingReviews = await prisma.review.count({ where: { tenantId: tenant.id } });
  if (existingReviews === 0) {
    const reviewData = [
      { customerName: 'Zeynep K.', productName: 'iPhone 15 Pro Max', platform: 'TRENDYOL', rating: 5, comment: 'Harika bir telefon, çok memnunum. Kamera kalitesi muhteşem!', status: 'published', verified: true, helpful: 24 },
      { customerName: 'Mert A.', productName: 'Samsung Galaxy S24 Ultra', platform: 'HEPSIBURADA', rating: 4, comment: 'Güzel telefon ama fiyatı biraz yüksek. Galaxy AI özellikleri çok iyi.', status: 'published', verified: true, helpful: 18, reply: 'Değerli yorumunuz için teşekkür ederiz!' },
      { customerName: 'Selin D.', productName: 'Sony WH-1000XM5', platform: 'AMAZON', rating: 5, comment: 'Gürültü önleme özelliği inanılmaz. Uçak yolculuklarında vazgeçilmez.', status: 'published', verified: true, helpful: 31 },
      { customerName: 'Can G.', productName: 'MacBook Air M3', platform: 'TRENDYOL', rating: 5, comment: 'M3 çipli MacBook Air performans canavarı. Pil ömrü gerçekten 18 saat.', status: 'published', verified: false, helpful: 15 },
      { customerName: 'Elif Y.', productName: 'Dyson V15 Detect', platform: 'HEPSIBURADA', rating: 3, comment: 'Fiyatına göre idare eder. Lazer özelliği güzel ama şarj süresi kısa.', status: 'published', verified: true, helpful: 8 },
      { customerName: 'Ahmet Ç.', productName: 'Nike Air Max 270', platform: 'N11', rating: 4, comment: 'Çok rahat bir ayakkabı. Günlük kullanım için ideal.', status: 'published', verified: true, helpful: 12 },
      { customerName: 'Ayşe B.', productName: 'Philips Airfryer XXL', platform: 'TRENDYOL', rating: 5, comment: 'Yemek pişirmeyi kolaylaştırdı. NutriU uygulaması harika tarifler sunuyor.', status: 'published', verified: true, helpful: 22, reply: 'Beğenmenize çok sevindik! Afiyet olsun.' },
      { customerName: 'Ali R.', productName: 'AirPods Pro 2', platform: 'AMAZON', rating: 4, comment: 'Ses kalitesi çok iyi. Şeffaf mod gerçekten doğal.', status: 'published', verified: false, helpful: 9 },
      { customerName: 'Fatma S.', productName: 'Samsung QN90C TV', platform: 'HEPSIBURADA', rating: 5, comment: 'Neo QLED teknolojisi gerçekten farkını gösteriyor. Renk doğruluğu mükemmel.', status: 'pending', verified: true, helpful: 5 },
      { customerName: 'Burak T.', productName: 'Karaca Hatır Hüps', platform: 'TRENDYOL', rating: 4, comment: 'Günde 3-4 fincan yapıyorum. Herkes beğeniyor. Fiyat/performans çok iyi.', status: 'published', verified: true, helpful: 27 },
      { customerName: 'Merve A.', productName: 'Xiaomi Redmi Note 13 Pro', platform: 'N11', rating: 3, comment: 'Fiyatına göre iyi ama kamera biraz geride kalıyor.', status: 'published', verified: true, helpful: 6 },
      { customerName: 'Emre Y.', productName: 'JBL Charge 5', platform: 'AMAZON', rating: 5, comment: 'Plajda, havuzda her yerde kullanıyorum. Ses kalitesi ve bas performansı süper!', status: 'published', verified: true, helpful: 19 },
    ];
    for (const [i, rev] of reviewData.entries()) {
      const prod = products[i % products.length];
      await prisma.review.create({
        data: {
          tenantId: tenant.id,
          productId: prod?.id,
          ...rev,
          reviewDate: new Date(Date.now() - i * 2 * 86400000),
        },
      });
    }
    console.log('✅ Yorumlar oluşturuldu');
  }

  // ==================== 17. STORES ====================
  const existingStores = await prisma.store.count({ where: { tenantId: tenant.id } });
  if (existingStores === 0) {
    const storeData = [
      { name: 'TechStore Trendyol', platform: 'TRENDYOL' as Platform, shopUrl: 'https://www.trendyol.com/magaza/techstore', status: 'active', productCount: 25, orderCount: 1250 },
      { name: 'TechStore Hepsiburada', platform: 'HEPSIBURADA' as Platform, shopUrl: 'https://www.hepsiburada.com/magaza/techstore', status: 'active', productCount: 22, orderCount: 890 },
      { name: 'TechStore Amazon', platform: 'AMAZON' as Platform, shopUrl: 'https://www.amazon.com.tr/shops/techstore', status: 'active', productCount: 20, orderCount: 650 },
      { name: 'TechStore N11', platform: 'N11' as Platform, shopUrl: 'https://www.n11.com/magaza/techstore', status: 'inactive', productCount: 15, orderCount: 320 },
    ];
    for (const store of storeData) {
      await prisma.store.create({ data: { tenantId: tenant.id, ...store } });
    }
    console.log('✅ Mağazalar oluşturuldu');
  }

  // ==================== 18. API KEYS ====================
  const existingApiKeys = await prisma.apiKey.count({ where: { tenantId: tenant.id } });
  if (existingApiKeys === 0) {
    await prisma.apiKey.create({
      data: {
        tenantId: tenant.id,
        userId: admin.id,
        name: 'Production API Key',
        key: `pk_live_${Math.random().toString(36).substr(2, 32)}`,
        prefix: 'pk_live',
        permissions: ['read', 'write', 'orders', 'products', 'inventory'],
        isActive: true,
        lastUsed: new Date(Date.now() - 3600000),
      },
    });
    await prisma.apiKey.create({
      data: {
        tenantId: tenant.id,
        userId: admin.id,
        name: 'Test API Key',
        key: `pk_test_${Math.random().toString(36).substr(2, 32)}`,
        prefix: 'pk_test',
        permissions: ['read'],
        isActive: true,
        expiresAt: new Date(Date.now() + 90 * 86400000),
      },
    });
    console.log('✅ API anahtarları oluşturuldu');
  }

  // ==================== 19. SEO ANALYSES ====================
  const existingSeo = await prisma.seoAnalysis.count({ where: { tenantId: tenant.id } });
  if (existingSeo === 0) {
    for (const prod of products.slice(0, 10)) {
      const titleLen = prod.title?.length || 0;
      const descLen = prod.description?.length || 0;
      const titleScore = titleLen >= 60 && titleLen <= 80 ? 92 : titleLen >= 40 ? 78 : 55;
      const descriptionScore = descLen >= 200 ? 88 : descLen >= 100 ? 68 : 35;
      const imageScore = 82;
      const keywordScore = 75;
      const score = Math.round((titleScore + descriptionScore + imageScore + keywordScore) / 4);

      const issues: string[] = [];
      if (titleLen < 40) issues.push('Başlık çok kısa, en az 40 karakter olmalı');
      if (titleLen > 100) issues.push('Başlık çok uzun, 60-80 karakter ideal');
      if (descLen < 200) issues.push('Açıklama en az 200 karakter olmalı');
      issues.push('Anahtar kelime yoğunluğu optimize edilmeli');

      await prisma.seoAnalysis.create({
        data: {
          tenantId: tenant.id,
          productId: prod.id,
          url: `https://pazaryonetimi.com/product/${prod.id}`,
          score,
          titleScore,
          descriptionScore,
          imageScore,
          keywordScore,
          issues,
          keywords: [prod.category || 'genel', prod.brand || 'marka', prod.title.split(' ')[0]],
          recommendations: { improveTitle: titleScore < 80, improveDescription: descriptionScore < 80 },
          analyzedAt: new Date(),
        },
      });
    }
    console.log('✅ SEO analizleri oluşturuldu');
  }

  // ==================== 20. PRICING RULES ====================
  const existingPricingRules = await prisma.pricingRule.count({ where: { tenantId: tenant.id } });
  if (existingPricingRules === 0) {
    const pricingData = [
      { name: 'Rekabetçi Fiyat Koruma', description: 'Rakip fiyatının %5 altında kal', type: 'competitive', conditions: { maxDiscount: 15, minMargin: 5, competitors: 'all' }, action: { type: 'match_competitor', offset: -5 }, priority: 1, isActive: true },
      { name: 'Stok Eritme İndirimi', description: 'Düşük satışlı ürünlerde otomatik indirim', type: 'clearance', conditions: { daysWithoutSale: 30, minStock: 10 }, action: { type: 'percentage_discount', value: 20 }, priority: 2, isActive: true },
      { name: 'Sezon Sonu Kampanyası', description: 'Sezon ürünlerinde kademeli indirim', type: 'seasonal', conditions: { categories: ['Moda'], endDate: '2025-03-01' }, action: { type: 'progressive_discount', steps: [10, 20, 30] }, priority: 3, isActive: false },
    ];
    for (const rule of pricingData) {
      await prisma.pricingRule.create({ data: { tenantId: tenant.id, ...rule } });
    }
    console.log('✅ Fiyatlama kuralları oluşturuldu');
  }

  // ==================== 21. DASHBOARD LAYOUTS ====================
  const existingLayouts = await prisma.dashboardLayout.count({ where: { tenantId: tenant.id } });
  if (existingLayouts === 0) {
    await prisma.dashboardLayout.create({
      data: {
        tenantId: tenant.id,
        userId: admin.id,
        name: 'default',
        layout: {
          widgets: [
            { id: 'revenue', x: 0, y: 0, w: 6, h: 2, visible: true },
            { id: 'orders', x: 6, y: 0, w: 6, h: 2, visible: true },
            { id: 'products', x: 0, y: 2, w: 4, h: 3, visible: true },
            { id: 'campaigns', x: 4, y: 2, w: 4, h: 3, visible: true },
            { id: 'reviews', x: 8, y: 2, w: 4, h: 3, visible: true },
          ],
        },
      },
    });
    console.log('✅ Dashboard layout oluşturuldu');
  }
  console.log('📊 Özet:');
  console.log(`   - ${await prisma.product.count({ where: { tenantId: tenant.id } })} ürün`);
  console.log(`   - ${await prisma.order.count({ where: { tenantId: tenant.id } })} sipariş`);
  console.log(`   - ${await prisma.integration.count({ where: { tenantId: tenant.id } })} entegrasyon`);
  console.log(`   - ${await prisma.competitor.count({ where: { tenantId: tenant.id } })} rakip`);
  console.log(`   - ${await prisma.activityLog.count({ where: { tenantId: tenant.id } })} aktivite logu`);
  console.log(`   - ${await prisma.supportTicket.count({ where: { tenantId: tenant.id } })} destek talebi`);
  console.log(`   - ${await prisma.webhook.count({ where: { tenantId: tenant.id } })} webhook`);
  console.log(`   - ${await prisma.automation.count({ where: { tenantId: tenant.id } })} otomasyon`);
  console.log(`   - ${await prisma.campaign.count({ where: { tenantId: tenant.id } })} kampanya`);
  console.log(`   - ${await prisma.review.count({ where: { tenantId: tenant.id } })} yorum`);
  console.log(`   - ${await prisma.store.count({ where: { tenantId: tenant.id } })} mağaza`);
  console.log(`   - ${await prisma.seoAnalysis.count({ where: { tenantId: tenant.id } })} SEO analizi`);

  if (process.env.SEED_FORUM === 'true') {
    console.log('\n🗣️  Forum seed başlatılıyor (SEED_FORUM=true)...');
    const { execSync } = await import('child_process');
    execSync('npx tsx prisma/seed-forum.ts', { stdio: 'inherit' });
  }

  if (process.env.SEED_HELP === 'true') {
    console.log('\n📚 Help seed başlatılıyor (SEED_HELP=true)...');
    const { execSync } = await import('child_process');
    execSync('npx tsx prisma/seed-help.ts', { stdio: 'inherit' });
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    if (pool) {
      await pool.end();
    }
  });
