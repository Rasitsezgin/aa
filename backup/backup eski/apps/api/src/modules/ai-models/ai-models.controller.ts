import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AiModelsService } from './ai-models.service';
import { AdvisorService } from './advisor.service';

@Controller('api/ai-models')
export class AiModelsController {
  constructor(
    private aiModelsService: AiModelsService,
    private advisorService: AdvisorService,
  ) {}

  @Get()
  async getAllModels() {
    return this.aiModelsService.findAllActive();
  }

  @Get(':id')
  async getModel(@Param('id') id: string) {
    return this.aiModelsService.findById(id);
  }

  @Post()
  async createModel(@Body() data: any) {
    return this.aiModelsService.createModel(data);
  }

  @Put(':id')
  async updateModel(@Param('id') id: string, @Body() data: any) {
    return this.aiModelsService.updateModel(id, data);
  }

  @Delete(':id')
  async deleteModel(@Param('id') id: string) {
    return this.aiModelsService.deleteModel(id);
  }

  @Put(':id/toggle')
  async toggleActive(@Param('id') id: string) {
    return this.aiModelsService.toggleActive(id);
  }

  @Post('advisor/generate')
  async generateAdvisorMessage(@Body() data: any): Promise<any> {
    return this.advisorService.generateAdvisorMessage(data);
  }

  @Get('advisor/history/:domain')
  async getAdvisorHistory(
    @Param('domain') domain: string,
    @Body('limit') limit: number = 10,
  ) {
    return this.advisorService.getAdvisorHistory(domain, limit);
  }
}
