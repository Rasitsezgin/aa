import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ImageEditorService {
    private readonly logger = new Logger(ImageEditorService.name);

    constructor(private prisma: PrismaService) {}

    // Ürün görsellerini getir
    async getProductImages(tenantId: string, productId: string) {
        const product = await this.prisma.product.findFirst({
            where: { id: productId, tenantId },
            include: { images: true },
        });

        if (!product) {
            return { images: [], product: null };
        }

        return {
            product: { id: product.id, title: product.title, sku: product.sku },
            images: product.images.map(img => ({
                id: img.id,
                url: img.url,
                isMain: img.isMain,
                altText: img.altText,
            })),
        };
    }

    // Düzenlenmiş görseli ürüne ekle (Base64 URL olarak)
    async addImageToProduct(tenantId: string, productId: string, imageUrl: string, altText?: string) {
        // Ürünün mevcut olduğunu doğrula
        const product = await this.prisma.product.findFirst({
            where: { id: productId, tenantId },
        });

        if (!product) {
            throw new Error('Ürün bulunamadı');
        }

        const image = await this.prisma.image.create({
            data: {
                url: imageUrl,
                isMain: false,
                altText: altText || 'Düzenlenmiş görsel',
                processed: true,
                productId,
            },
        });

        this.logger.log(`Ürün ${productId} için yeni görsel eklendi: ${image.id}`);
        return image;
    }

    // Ürünün ana görselini güncelle
    async updateMainImage(tenantId: string, productId: string, imageId: string) {
        const product = await this.prisma.product.findFirst({
            where: { id: productId, tenantId },
            include: { images: true },
        });

        if (!product) {
            throw new Error('Ürün bulunamadı');
        }

        // Mevcut ana görselin bayrağını kaldır
        await this.prisma.image.updateMany({
            where: { productId, isMain: true },
            data: { isMain: false },
        });

        // Yeni ana görseli işaretle
        const updated = await this.prisma.image.update({
            where: { id: imageId },
            data: { isMain: true },
        });

        return updated;
    }

    // Görsel sil
    async deleteImage(tenantId: string, productId: string, imageId: string) {
        const product = await this.prisma.product.findFirst({
            where: { id: productId, tenantId },
        });

        if (!product) {
            throw new Error('Ürün bulunamadı');
        }

        await this.prisma.image.delete({
            where: { id: imageId },
        });

        return { success: true };
    }

    // Editör şablonlarını getir
    getTemplates() {
        return [
            {
                id: 'product-showcase',
                name: 'Ürün Vitrin',
                description: 'Temiz arka planlı ürün gösterimi',
                category: 'marketplace',
                width: 800,
                height: 800,
                thumbnail: '/images/templates/product-showcase.png',
            },
            {
                id: 'sale-banner',
                name: 'İndirim Banner',
                description: 'Dikkat çekici indirim görseli',
                category: 'social',
                width: 1080,
                height: 1080,
                thumbnail: '/images/templates/sale-banner.png',
            },
            {
                id: 'story-promo',
                name: 'Story Promosyon',
                description: 'Instagram/TikTok story formatı',
                category: 'social',
                width: 1080,
                height: 1920,
                thumbnail: '/images/templates/story-promo.png',
            },
            {
                id: 'youtube-thumb',
                name: 'YouTube Küçük Resim',
                description: 'Dikkat çekici thumbnail',
                category: 'social',
                width: 1280,
                height: 720,
                thumbnail: '/images/templates/youtube-thumb.png',
            },
            {
                id: 'facebook-ad',
                name: 'Facebook Reklam',
                description: 'Facebook reklam görseli',
                category: 'social',
                width: 1200,
                height: 630,
                thumbnail: '/images/templates/facebook-ad.png',
            },
            {
                id: 'product-comparison',
                name: 'Ürün Karşılaştırma',
                description: 'Yan yana ürün gösterimi',
                category: 'marketplace',
                width: 1080,
                height: 1080,
                thumbnail: '/images/templates/product-comparison.png',
            },
        ];
    }
}
