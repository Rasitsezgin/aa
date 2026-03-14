import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CustomerSegmentationService } from './customer-segmentation.service';

@ApiTags('Customer Segmentation (RFM)')
@Controller('customers/segmentation')
export class CustomerSegmentationController {
  constructor(private segmentationService: CustomerSegmentationService) {}

  @Get('rfm')
  @ApiOperation({ summary: 'RFM analizi al' })
  async getRFMAnalysis(@Query('tenantId') tenantId: string) {
    return this.segmentationService.getRFMAnalysis(tenantId);
  }

  @Get('segment/:name')
  @ApiOperation({ summary: 'Segment detayı' })
  async getSegmentDetail(
    @Param('name') name: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.segmentationService.getSegmentDetail(tenantId, name);
  }
}
