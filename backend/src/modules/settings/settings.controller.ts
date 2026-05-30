import { Controller, Get, Put, Body, Inject, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service.js';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard.js';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(@Inject(SettingsService) private readonly svc: SettingsService) {}

  @Get() getAll() { return this.svc.getAll(); }
  @Put() update(@Body() dto: Record<string, string>) { return this.svc.update(dto); }
}
