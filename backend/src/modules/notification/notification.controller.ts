import { Body, Controller, Get, Inject, Param, Post, Put, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service.js';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../../core/guards/permissions.guard.js';
import { Permissions } from '../../core/decorators/permissions.decorator.js';
import { CurrentUser } from '../../core/decorators/current-user.decorator.js';

@Controller('notifications')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class NotificationController {
  constructor(@Inject(NotificationService) private readonly notificationService: NotificationService) {}

  @Get()
  @Permissions('notifications.view')
  async list(@CurrentUser() user: any) {
    return this.notificationService.findAll(user.userId || user.id);
  }

  @Put(':id/read')
  @Permissions('notifications.update')
  async markRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }

  @Post('send')
  @Permissions('notifications.create')
  async send(@Body() payload: { recipient: string; title: string; message: string }) {
    return this.notificationService.create(payload.recipient, payload.title, payload.message);
  }
}
