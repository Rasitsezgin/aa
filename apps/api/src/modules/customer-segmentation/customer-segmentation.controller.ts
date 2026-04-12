import { Controller, Get, Query, Param, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CustomerSegmentationService } from './customer-segmentation.service';

@ApiTags('Customer Segmentation (RFM)')
@Controller('customers/segmentation')
export class CustomerSegmentationController {
  constructor(private segmentationService: CustomerSegmentationService) {}

  @Get('rfm')
  @ApiOperation({ summary: 'RFM analizi al' })
  async getRFMAnalysis(@Headers('x-tenant-id') tenantId: string) {
    return this.segmentationService.getRFMAnalysis(tenantId || 'demo-tenant');
  }

  @Get('segment/:name')
  @ApiOperation({ summary: 'Segment detayı' })
  async getSegmentDetail(
    @Param('name') name: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.segmentationService.getSegmentDetail(
      tenantId || 'demo-tenant',
      name,
    );
  }
}
