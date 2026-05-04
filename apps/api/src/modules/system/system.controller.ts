import { Controller, Get, Post, Body, Headers, Param } from '@nestjs/common';
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

  @Post('services/:serviceId/:action')
  async controlService(
    @Param('serviceId') serviceId: string,
    @Param('action') action: 'start' | 'stop' | 'restart',
  ) {
    return this.systemService.controlService(serviceId, action);
  }

  @Get('database')
  async getDatabaseInfo() {
    return this.systemService.getDatabaseInfo();
  }

  @Post('database/:action')
  async databaseAction(
    @Param('action') action: 'backup' | 'migrate' | 'optimize',
  ) {
    return this.systemService.databaseAction(action);
  }

  @Get('deployment')
  async getDeploymentInfo() {
    return this.systemService.getDeploymentInfo();
  }

  @Post('scripts/:scriptName/run')
  async runScript(@Param('scriptName') scriptName: string) {
    return this.systemService.runScript(scriptName);
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
