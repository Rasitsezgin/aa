import { Controller, Get, Post, Body, Headers } from '@nestjs/common';
import { SystemService } from './system.service';
import { SimulationService } from './simulation.service';
import type { SimulationScenario } from './simulation.service';

@Controller('system')
export class SystemController {
  constructor(
    private readonly systemService: SystemService,
    private readonly simulationService: SimulationService,
  ) {}

  @Get('metrics')
  async getMetrics() {
    return this.systemService.getSystemMetrics();
  }

  @Get('services')
  async getServices() {
    return this.systemService.getServiceStatuses();
  }

  @Get('stats')
  async getStats() {
    return this.systemService.getPlatformStats();
  }

  @Get('realtime')
  async getRealtimeDashboard() {
    return this.systemService.getRealtimeDashboard();
  }

  @Post('simulate')
  async runSimulation(
    @Headers('x-tenant-id') tenantId: string,
    @Body() scenario: SimulationScenario,
  ) {
    return this.simulationService.runSimulation(
      tenantId || 'default',
      scenario,
    );
  }
}
