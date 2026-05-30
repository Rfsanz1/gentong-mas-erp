import { Module } from '@nestjs/common';
import { DriverAreasController } from './driver-areas.controller.js';
import { DriverAreasService } from './driver-areas.service.js';
import { PrismaService } from '../../core/prisma/prisma.service.js';

@Module({ controllers: [DriverAreasController], providers: [DriverAreasService, PrismaService], exports: [DriverAreasService] })
export class DriverAreasModule {}
