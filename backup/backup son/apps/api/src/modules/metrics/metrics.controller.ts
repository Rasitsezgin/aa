import { Controller, Get, Header, VERSION_NEUTRAL } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { Public } from '../auth/public.decorator';

@Controller({ path: 'metrics', version: VERSION_NEUTRAL })
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Public()
  @Get()
  @Header('Content-Type', 'text/plain')
  async getMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }
}
