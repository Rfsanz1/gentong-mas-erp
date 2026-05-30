import { Module } from '@nestjs/common';
import { ManufacturingController } from './manufacturing.controller.js';
import { ManufacturingService } from './manufacturing.service.js';
import { PrismaService } from '../../core/prisma/prisma.service.js';

@Module({ controllers: [ManufacturingController], providers: [ManufacturingService, PrismaService], exports: [ManufacturingService] })
export class ManufacturingModule {}
