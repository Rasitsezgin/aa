import {
    Injectable,
    Logger,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MarketplaceService, Platform, MarketplaceReview } from '../marketplace/marketplace.service';

export interface SyncReviewsResult {
    platform: string;
    synced: number;
    created: number;
    skipped: number;
    error?: string;
}

@Injectable()
export class ReviewsService {
    private readonly logger = new Logger(ReviewsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly marketplaceService: MarketplaceService,
    ) {}

    /**
     * Belirli bir platform için yorumları pazaryerinden çek ve kaydet
     */
    async syncReviewsFromPlatform(tenantId: string, platform: string): Promise<SyncReviewsResult> {
        const result: SyncReviewsResult = { platform, synced: 0, created: 0, skipped: 0 };
        try {
            const bridge = await this.marketplaceService.getBridgeForTenant(
                tenantId,
                platform as Platform,
            );
            if (!bridge.getReviews) {
                result.error = `${platform} köprüsü yorum desteği sunmuyor`;
                return result;
            }

            // İlk 3 sayfayı çek (max 300 yorum)
            const allReviews: MarketplaceReview[] = [];
            for (let page = 0; page < 3; page++) {
                const batch = await bridge.getReviews(page, 100);
                if (!batch.length) break;
                allReviews.push(...batch);
                if (batch.length < 100) break;
            }

            result.synced = allReviews.length;

            for (const review of allReviews) {
                if (!review.externalId || !review.comment) {
                    result.skipped++;
                    continue;
                }

                // Upsert: duplicate'i önle
                const existing = await this.prisma.review.findFirst({
                    where: { tenantId, platform, externalId: review.externalId },
                });

                if (existing) {
                    result.skipped++;
                    continue;
                }

                await this.prisma.review.create({
                    data: {
                        tenantId,
                        externalId: review.externalId,
                        productId: review.productId || null,
                        productName: review.productName || 'Ürün',
                        customerName: review.customerName || 'Müşteri',
                        platform,
                        rating: Math.min(5, Math.max(1, review.rating || 3)),
                        title: review.title || null,
                        comment: review.comment,
                        reviewDate: review.reviewDate || new Date(),
                        helpful: review.helpful || 0,
                        verified: review.verified || false,
                        status: 'pending',
                    },
                });
                result.created++;
            }
        } catch (error) {
            result.error = (error as Error).message;
            this.logger.error(`syncReviews [${platform}] tenantId=${tenantId}: ${result.error}`);
        }
        return result;
    }

    /**
     * Tüm aktif entegrasyonlar için yorum senkronizasyonu
     */
    async syncAllPlatforms(tenantId: string): Promise<SyncReviewsResult[]> {
        const integrations = await this.prisma.integration.findMany({
            where: { tenantId, isActive: true },
            select: { platform: true },
        });

        const results: SyncReviewsResult[] = [];
        for (const integration of integrations) {
            const result = await this.syncReviewsFromPlatform(
                tenantId,
                integration.platform as string,
            );
            results.push(result);
        }
        return results;
    }

    /**
     * Yorumları listele (filtre ve sayfalama destekli)
     */
    async getReviews(
        tenantId: string,
        options: {
            page?: number;
            limit?: number;
            platform?: string;
            rating?: number;
            status?: string;
            search?: string;
            productId?: string;
        } = {},
    ) {
        const { page = 1, limit = 20, platform, rating, status, search, productId } = options;
        const skip = (page - 1) * limit;

        const where: any = { tenantId };
        if (platform) where.platform = platform;
        if (rating) where.rating = Number(rating);
        if (status) where.status = status;
        if (productId) where.productId = productId;
        if (search) {
            where.OR = [
                { comment: { contains: search, mode: 'insensitive' } },
                { customerName: { contains: search, mode: 'insensitive' } },
                { productName: { contains: search, mode: 'insensitive' } },
                { title: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [reviews, total] = await Promise.all([
            this.prisma.review.findMany({
                where,
                orderBy: { reviewDate: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.review.count({ where }),
        ]);

        return {
            data: reviews,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Yorum istatistikleri
     */
    async getReviewStats(tenantId: string) {
        const [
            totalReviews,
            avgRatingAgg,
            ratingDistribution,
            platformBreakdown,
            pendingCount,
            replyRate,
        ] = await Promise.all([
            this.prisma.review.count({ where: { tenantId } }),
            this.prisma.review.aggregate({
                where: { tenantId },
                _avg: { rating: true },
            }),
            this.prisma.review.groupBy({
                by: ['rating'],
                where: { tenantId },
                _count: { rating: true },
            }),
            this.prisma.review.groupBy({
                by: ['platform'],
                where: { tenantId },
                _count: { platform: true },
                _avg: { rating: true },
            }),
            this.prisma.review.count({ where: { tenantId, status: 'pending' } }),
            this.prisma.review.count({ where: { tenantId, status: 'replied' } }),
        ]);

        const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        for (const r of ratingDistribution) {
            dist[r.rating] = r._count.rating;
        }

        return {
            totalReviews,
            averageRating: Number((avgRatingAgg._avg.rating || 0).toFixed(1)),
            pendingCount,
            repliedCount: replyRate,
            replyRate: totalReviews > 0 ? Math.round((replyRate / totalReviews) * 100) : 0,
            positivePercent:
                totalReviews > 0
                    ? Math.round(
                          ((dist[4] + dist[5]) / totalReviews) * 100,
                      )
                    : 0,
            ratingDistribution: dist,
            platformBreakdown: platformBreakdown.map((p) => ({
                platform: p.platform,
                count: p._count.platform,
                avgRating: Number((p._avg.rating || 0).toFixed(1)),
            })),
        };
    }

    /**
     * Yoruma yanıt ekle
     */
    async replyToReview(tenantId: string, reviewId: string, reply: string) {
        if (!reply?.trim()) throw new BadRequestException('Yanıt boş olamaz');

        const review = await this.prisma.review.findFirst({ where: { id: reviewId, tenantId } });
        if (!review) throw new NotFoundException('Yorum bulunamadı');

        return this.prisma.review.update({
            where: { id: reviewId },
            data: { reply: reply.trim(), repliedAt: new Date(), status: 'replied' },
        });
    }

    /**
     * Yorum durumunu güncelle (flagged, hidden, pending)
     */
    async updateReviewStatus(tenantId: string, reviewId: string, status: string) {
        const allowed = ['pending', 'replied', 'flagged', 'hidden'];
        if (!allowed.includes(status)) throw new BadRequestException(`Geçersiz durum: ${status}`);

        const review = await this.prisma.review.findFirst({ where: { id: reviewId, tenantId } });
        if (!review) throw new NotFoundException('Yorum bulunamadı');

        return this.prisma.review.update({ where: { id: reviewId }, data: { status } });
    }

    /**
     * Toplu yorum durumu güncelle
     */
    async bulkUpdateStatus(tenantId: string, reviewIds: string[], status: string) {
        const allowed = ['pending', 'replied', 'flagged', 'hidden'];
        if (!allowed.includes(status)) throw new BadRequestException(`Geçersiz durum: ${status}`);

        const result = await this.prisma.review.updateMany({
            where: { id: { in: reviewIds }, tenantId },
            data: { status },
        });
        return { updated: result.count };
    }
}
