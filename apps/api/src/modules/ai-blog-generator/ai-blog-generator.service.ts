import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiBlogGeneratorService {
  private readonly logger = new Logger(AiBlogGeneratorService.name);
  private readonly genAI: GoogleGenerativeAI;
  
  constructor(private readonly prisma: PrismaService) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    if (!apiKey) {
      this.logger.warn('No Gemini API key found in environment variables (GEMINI_API_KEY or GOOGLE_API_KEY). AI blog generator might fail.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateDailyBlogs() {
    this.logger.log('Starting daily blog generation process (10 posts)...');
    try {
      const topics = await this.generateTopics();
      if (!topics || topics.length === 0) {
        this.logger.error('Failed to generate topics.');
        return;
      }
      
      this.logger.log(`Generated ${topics.length} topics. Processing them...`);
      
      let successCount = 0;
      for (const topic of topics) {
        try {
          const blogData = await this.generateBlogContent(topic);
          await this.saveToDatabase(blogData);
          successCount++;
          this.logger.log(`Successfully generated and saved blog: ${blogData.title}`);
          
          // Add a small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (err: any) {
          this.logger.error(`Error generating/saving blog for topic '${topic}':`, err.message);
        }
      }
      
      this.logger.log(`Daily blog generation completed. Success: ${successCount}/10`);
    } catch (error: any) {
      this.logger.error('Failed to run daily blog generation:', error.message);
    }
  }

  private async generateTopics(): Promise<string[]> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Sen e-ticaret ve pazar yönetimi (Trendyol, Hepsiburada, Amazon vb.) uzmanı ve harika bir SEO içerik stratejistisin. 
Türkiye e-ticaret pazarı, stok yönetimi, satış artırma stratejileri, pazaryeri entegrasyonları konularında 10 adet ÇOK DİKKAT ÇEKİCİ (tıklama arzusu uyandıran) ve SEO uyumlu blog yazısı başlığı öner. Başlıklar insanların Google'da aratacağı kadar doğal ve ilgi çekici olsun.
Sadece başlıkları döndür, her satıra bir başlık yaz. Madde işareti veya numara kullanma. Tam 10 satır olsun.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Split by newlines and clean up
    const topics = text.split('\n')
      .map(t => t.replace(/^[0-9.-]+\s*/, '').trim())
      .filter(t => t.length > 5)
      .slice(0, 10);
      
    return topics;
  }

  private async generateBlogContent(topic: string): Promise<{title: string, content: string, slug: string}> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Sen profesyonel bir e-ticaret uzmanı, yetenekli bir metin yazarı ve üst düzey bir SEO içerik yazarısın. Aşağıdaki başlık için Türkçe, detaylı, akıcı, okuyucuyu sıkmayan İNSANSI bir dille ve SEO uyumlu harika bir blog yazısı oluştur:

Başlık: "${topic}"

Kurallar:
1. YAZIM DİLİ: Kesinlikle yapay zeka tarafından yazıldığı belli olmayan, doğal, samimi, akıcı ve insansı bir dil kullan. Uzman tavsiyesi veriyormuş gibi güven verici ama sohbet ediyormuş gibi rahat bir üslubun olsun.
2. SEO UYUMU: İlgili anahtar kelimeleri metin içine doğal bir şekilde yerleştir. Okunabilirlik seviyesini yüksek tut.
3. FORMAT: Yazı görsel olarak zengin HTML formatında olmalıdır. Paragrafları kısa tut. Vurgulamak istediğin önemli kelime ve cümleleri <strong> ile kalınlaştır. Maddeleme (<ul>, <li>) ve alt başlıkları (<h2>, <h3>) bolca ve mantıklı kullan. <h1> KESİNLİKLE kullanma.
4. UZUNLUK VE YAPI: Ortalama 600-800 kelime uzunluğunda, doyurucu bir içerik olsun. Etkileyici bir giriş, detaylı bir gelişme ve net bir sonuç (özet/harekete geçirici mesaj) bölümü olsun.
5. ÇIKTI FORMATI: Markdown formatı veya kod bloğu (\`\`\`) KESİNLİKLE KULLANMA, doğrudan saf HTML metnini döndür. Merhaba, nasılsın gibi hiçbir ekstra açıklama ekleme.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let content = response.text().trim();
    
    // Remove markdown code blocks if AI wrapped the HTML
    if (content.startsWith('```html')) {
        content = content.replace(/```html/g, '').replace(/```/g, '').trim();
    } else if (content.startsWith('```')) {
        content = content.replace(/```/g, '').trim();
    }

    // Generate a simple slug
    const slug = topic
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-') + '-' + Math.floor(Math.random() * 10000).toString();

    return { title: topic, content, slug };
  }

  private async saveToDatabase(data: {title: string, content: string, slug: string}) {
    await this.prisma.cmsPage.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        category: 'blog',
        isActive: true,
      }
    });
  }
}
