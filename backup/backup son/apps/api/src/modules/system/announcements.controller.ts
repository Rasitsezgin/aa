import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { AnnouncementsService, CreateAnnouncementDto, UpdateAnnouncementDto } from './announcements.service';

@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  // Get all announcements (admin)
  @Get()
  async findAll() {
    return this.announcementsService.findAll();
  }

  // Get active announcements
  @Get('active')
  async findActive() {
    return this.announcementsService.findActive();
  }

  // Get stats
  @Get('stats')
  async getStats() {
    return this.announcementsService.getStats();
  }

  // Get announcements for a tenant
  @Get('tenant/:tenantId')
  async findForTenant(@Param('tenantId') tenantId: string) {
    return this.announcementsService.findForTenant(tenantId);
  }

  // Get single announcement
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.announcementsService.findOne(id);
  }

  // Create announcement
  @Post()
  async create(@Body() dto: CreateAnnouncementDto) {
    return this.announcementsService.create(dto);
  }

  // Update announcement
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAnnouncementDto) {
    return this.announcementsService.update(id, dto);
  }

  // Toggle announcement status
  @Put(':id/toggle')
  async toggle(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.announcementsService.toggle(id, isActive);
  }

  // Pin/unpin announcement
  @Put(':id/pin')
  async pin(@Param('id') id: string, @Body('isPinned') isPinned: boolean) {
    return this.announcementsService.pin(id, isPinned);
  }

  // Delete announcement
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.announcementsService.delete(id);
  }

  // Mark as read
  @Post(':id/read')
  async markAsRead(@Param('id') id: string, @Body('tenantId') tenantId: string) {
    return this.announcementsService.markAsRead(id, tenantId);
  }

  // Dismiss announcement
  @Post(':id/dismiss')
  async dismiss(@Param('id') id: string, @Body('tenantId') tenantId: string) {
    return this.announcementsService.dismiss(id, tenantId);
  }
}
