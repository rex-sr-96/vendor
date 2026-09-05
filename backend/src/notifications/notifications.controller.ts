import { Controller, Get, Patch, Post, Delete, Param, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll() { return this.notificationsService.findAll(); }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) { return this.notificationsService.markAsRead(id); }

  @Post('read-all')
  markAllAsRead() { return this.notificationsService.markAllAsRead(); }

  @Delete(':id')
  delete(@Param('id') id: string) { return { deleted: this.notificationsService.delete(id) }; }

  @Get('preferences')
  getPreferences() { return this.notificationsService.getPreferences(); }

  @Patch('preferences')
  updatePreferences(@Body() data: any) { return this.notificationsService.updatePreferences(data); }
}
