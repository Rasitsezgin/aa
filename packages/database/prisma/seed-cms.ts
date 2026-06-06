import { PrismaClient } from '../generated/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding default CMS landing page...')

  // Ana sayfa kontrolü
  const existingHomePage = await prisma.page.findFirst({
    where: { isHomePage: true }
  })

  if (existingHomePage) {
    console.log('Home page already exists, skipping seed.')
    return
  }

  // Varsayılan landing page oluştur
  const homePage = await prisma.page.create({
    data: {
      slug: 'home',
      title: 'Pazaryonetimi | AI Destekli E-ticaret Yönetim Platformu',
      description: 'Trendyol, Hepsiburada, Amazon, N11, Çiçeksepeti — tüm pazaryerlerinizi tek platformdan yönetin. AI destekli stok senkronizasyonu, akıllı fiyatlandırma ve satış tahminleri.',
      type: 'LANDING',
      status: 'PUBLISHED',
      metaTitle: 'Pazaryonetimi | AI Destekli E-ticaret Yönetim Platformu',
      metaDescription: 'Tüm pazaryerlerinizi tek platformdan yönetin. AI destekli e-ticaret çözümleri ile satışlarınızı artırın.',
      metaKeywords: 'e-ticaret, pazaryeri, trendyol, amazon, hepsiburada, stok yönetimi, fiyatlandırma',
      layout: 'default',
      theme: 'light',
      isHomePage: true,
      isActive: true,
      sortOrder: 0,
      publishedAt: new Date(),
    },
  })

  console.log('Created home page:', homePage.id)

  // Hero Section
  const heroSection = await prisma.pageSection.create({
    data: {
      pageId: homePage.id,
      name: 'HERO',
      title: null,
      subtitle: null,
      bgColor: 'bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900',
      textColor: 'text-white',
      padding: 'py-20 lg:py-32',
      container: 'container',
      columns: 1,
      sortOrder: 0,
      isActive: true,
    },
  })

  // Features Section
  const featuresSection = await prisma.pageSection.create({
    data: {
      pageId: homePage.id,
      name: 'FEATURES',
      title: 'Neden Pazaryonetimi?',
      subtitle: 'E-ticaret operasyonlarınızı bir üst seviyeye taşıyın',
      bgColor: 'bg-slate-50',
      textColor: 'text-slate-900',
      padding: 'py-20',
      container: 'container',
      columns: 3,
      sortOrder: 1,
      isActive: true,
    },
  })

  // Stats Section
  const statsSection = await prisma.pageSection.create({
    data: {
      pageId: homePage.id,
      name: 'STATS',
      title: null,
      subtitle: null,
      bgColor: 'bg-slate-900',
      textColor: 'text-white',
      padding: 'py-16',
      container: 'container',
      columns: 4,
      sortOrder: 2,
      isActive: true,
    },
  })

  // Integrations Section
  const integrationsSection = await prisma.pageSection.create({
    data: {
      pageId: homePage.id,
      name: 'INTEGRATIONS',
      title: 'Entegre Pazaryerleri',
      subtitle: 'Tüm büyük pazaryerleriyle sorunsuz entegrasyon',
      bgColor: 'bg-slate-50',
      textColor: 'text-slate-900',
      padding: 'py-20',
      container: 'container',
      columns: 8,
      sortOrder: 3,
      isActive: true,
    },
  })

  // Pricing Section
  const pricingSection = await prisma.pageSection.create({
    data: {
      pageId: homePage.id,
      name: 'PRICING',
      title: 'Fiyatlandırma',
      subtitle: 'İhtiyacınıza uygun planı seçin',
      bgColor: 'bg-white',
      textColor: 'text-slate-900',
      padding: 'py-20',
      container: 'container',
      columns: 3,
      sortOrder: 4,
      isActive: true,
    },
  })

  // Testimonials Section
  const testimonialsSection = await prisma.pageSection.create({
    data: {
      pageId: homePage.id,
      name: 'TESTIMONIALS',
      title: 'Müşterilerimiz Ne Diyor?',
      subtitle: 'Binlerce işletme Pazaryonetimi\'ye güveniyor',
      bgColor: 'bg-slate-50',
      textColor: 'text-slate-900',
      padding: 'py-20',
      container: 'container',
      columns: 3,
      sortOrder: 5,
      isActive: true,
    },
  })

  // FAQ Section
  const faqSection = await prisma.pageSection.create({
    data: {
      pageId: homePage.id,
      name: 'FAQ',
      title: 'Sıkça Sorulan Sorular',
      subtitle: 'Merak ettiğiniz soruların cevapları',
      bgColor: 'bg-white',
      textColor: 'text-slate-900',
      padding: 'py-20',
      container: 'container',
      columns: 1,
      sortOrder: 6,
      isActive: true,
    },
  })

  // CTA Section
  const ctaSection = await prisma.pageSection.create({
    data: {
      pageId: homePage.id,
      name: 'CTA',
      title: 'Hemen Başlayın',
      subtitle: '14 gün ücretsiz deneme, kredi kartı gerektirmez.',
      bgColor: 'bg-blue-600',
      textColor: 'text-white',
      padding: 'py-20',
      container: 'container',
      columns: 1,
      sortOrder: 7,
      isActive: true,
    },
  })

  console.log('Created sections:', {
    hero: heroSection.id,
    features: featuresSection.id,
    stats: statsSection.id,
    integrations: integrationsSection.id,
    pricing: pricingSection.id,
    testimonials: testimonialsSection.id,
    faq: faqSection.id,
    cta: ctaSection.id,
  })

  console.log('✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
