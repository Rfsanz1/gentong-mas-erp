import { Module } from '@nestjs/common';
import { MaintenanceController } from './maintenance.controller.js';
import { MaintenanceService } from './maintenance.service.js';
import { PrismaService } from '../../core/prisma/prisma.service.js';

@Module({ controllers: [MaintenanceController], providers: [MaintenanceService, PrismaService], exports: [MaintenanceService] })
export class MaintenanceModule {}
