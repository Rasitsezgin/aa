import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { XmlFeedsService } from './xml-feeds.service';

@ApiTags('XML Feeds')
@Controller('xml-feeds')
export class XmlFeedsController {
  constructor(private readonly xmlFeedsService: XmlFeedsService) {}

  @Get()
  @ApiOperation({ summary: 'XML Feed kaynaklarını listele' })
  getFeeds(@Req() req: any) {
    const tenantId = req.user?.tenantId || 'demo-tenant';
    return this.xmlFeedsService.getFeeds(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Yeni XML Feed kaynağı ekle' })
  createFeed(@Req() req: any, @Body() data: { name: string; url: string }) {
    const tenantId = req.user?.tenantId || 'demo-tenant';
    return this.xmlFeedsService.createFeed(tenantId, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'XML Feed sil' })
  deleteFeed(@Req() req: any, @Param('id') id: string) {
    const tenantId = req.user?.tenantId || 'demo-tenant';
    return this.xmlFeedsService.deleteFeed(tenantId, id);
  }

  @Post(':id/sync')
  @ApiOperation({ summary: 'XML Feed senkronize et' })
  syncFeed(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body?: { profitMargin?: number },
  ) {
    const tenantId = req.user?.tenantId || 'demo-tenant';
    return this.xmlFeedsService.syncFeed(
      tenantId,
      id,
      body?.profitMargin ?? 25,
    );
  }

  @Post('ai-match-category')
  @ApiOperation({ summary: 'Yapay zeka ile kategori ve zorunlu özellik eşle' })
  aiMatchCategory(
    @Body() body: { category: string; platform?: string },
  ) {
    return this.xmlFeedsService.matchCategoryWithAi(
      body.category,
      body.platform || 'TRENDYOL',
    );
  }
}
