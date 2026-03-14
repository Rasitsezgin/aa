import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    Query,
    Headers,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) {}

    /**
     * GET /reviews
     * Yorumları platform/puan/durum filtresiyle listele
     */
    @Get()
    async getReviews(
        @Headers('x-tenant-id') tenantId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('platform') platform?: string,
        @Query('rating') rating?: string,
        @Query('status') status?: string,
        @Query('search') search?: string,
        @Query('productId') productId?: string,
    ) {
        return this.reviewsService.getReviews(tenantId, {
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 20,
            platform,
            rating: rating ? Number(rating) : undefined,
            status,
            search,
            productId,
        });
    }

    /**
     * GET /reviews/stats
     * Tüm platformlar için özet istatistikler
     */
    @Get('stats')
    async getStats(@Headers('x-tenant-id') tenantId: string) {
        return this.reviewsService.getReviewStats(tenantId);
    }

    /**
     * POST /reviews/sync
     * Tüm aktif platformlardan yorumları çek ve kaydet
     */
    @Post('sync')
    @HttpCode(HttpStatus.OK)
    async syncAll(@Headers('x-tenant-id') tenantId: string) {
        return this.reviewsService.syncAllPlatforms(tenantId);
    }

    /**
     * POST /reviews/sync/:platform
     * Belirli bir platformdan yorum senkronizasyonu
     */
    @Post('sync/:platform')
    @HttpCode(HttpStatus.OK)
    async syncPlatform(
        @Headers('x-tenant-id') tenantId: string,
        @Param('platform') platform: string,
    ) {
        return this.reviewsService.syncReviewsFromPlatform(
            tenantId,
            platform.toUpperCase(),
        );
    }

    /**
     * POST /reviews/:id/reply
     * Yoruma yanıt ekle
     */
    @Post(':id/reply')
    async replyToReview(
        @Headers('x-tenant-id') tenantId: string,
        @Param('id') reviewId: string,
        @Body() body: { reply: string },
    ) {
        return this.reviewsService.replyToReview(tenantId, reviewId, body.reply);
    }

    /**
     * PATCH /reviews/:id/status
     * Yorum durumunu güncelle (pending | replied | flagged | hidden)
     */
    @Patch(':id/status')
    async updateStatus(
        @Headers('x-tenant-id') tenantId: string,
        @Param('id') reviewId: string,
        @Body() body: { status: string },
    ) {
        return this.reviewsService.updateReviewStatus(tenantId, reviewId, body.status);
    }

    /**
     * POST /reviews/bulk-status
     * Toplu durum güncelleme
     */
    @Post('bulk-status')
    @HttpCode(HttpStatus.OK)
    async bulkStatus(
        @Headers('x-tenant-id') tenantId: string,
        @Body() body: { reviewIds: string[]; status: string },
    ) {
        return this.reviewsService.bulkUpdateStatus(tenantId, body.reviewIds, body.status);
    }
}
