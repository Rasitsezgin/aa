import { Controller, Get, Post, Delete, Put, Param, Headers, Body } from '@nestjs/common';
import { ImageEditorService } from './image-editor.service';

@Controller('image-editor')
export class ImageEditorController {
    constructor(private readonly imageEditorService: ImageEditorService) {}

    // Ürün görsellerini getir
    @Get('products/:productId/images')
    async getProductImages(
        @Headers('x-tenant-id') tenantId: string,
        @Param('productId') productId: string,
    ) {
        return this.imageEditorService.getProductImages(tenantId, productId);
    }

    // Düzenlenmiş görseli ürüne ekle
    @Post('products/:productId/upload-image')
    async uploadImage(
        @Headers('x-tenant-id') tenantId: string,
        @Param('productId') productId: string,
        @Body() body: { imageUrl: string; altText?: string },
    ) {
        return this.imageEditorService.addImageToProduct(
            tenantId,
            productId,
            body.imageUrl,
            body.altText,
        );
    }

    // Ana görseli güncelle
    @Put('products/:productId/images/:imageId/set-main')
    async setMainImage(
        @Headers('x-tenant-id') tenantId: string,
        @Param('productId') productId: string,
        @Param('imageId') imageId: string,
    ) {
        return this.imageEditorService.updateMainImage(tenantId, productId, imageId);
    }

    // Görsel sil
    @Delete('products/:productId/images/:imageId')
    async deleteImage(
        @Headers('x-tenant-id') tenantId: string,
        @Param('productId') productId: string,
        @Param('imageId') imageId: string,
    ) {
        return this.imageEditorService.deleteImage(tenantId, productId, imageId);
    }

    // Şablonları getir
    @Get('templates')
    async getTemplates() {
        return this.imageEditorService.getTemplates();
    }
}
