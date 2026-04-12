import { Controller, Get, Post, Put, Delete, Body, Param, Headers } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @Post()
    async create(@Headers('x-tenant-id') tenantId: string, @Body() data: any) {
        return this.productService.create(tenantId, data);
    }

    @Get()
    async findAll(@Headers('x-tenant-id') tenantId: string) {
        return this.productService.findAll(tenantId);
    }

    @Get(':id')
    async findOne(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
        return this.productService.findOne(tenantId, id);
    }

    @Put(':id')
    async update(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string, @Body() data: any) {
        return this.productService.update(tenantId, id, data);
    }

    @Delete(':id')
    async remove(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
        return this.productService.remove(tenantId, id);
    }
}
