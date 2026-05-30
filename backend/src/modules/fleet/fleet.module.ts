import { Module } from '@nestjs/common';
import { FleetController } from './fleet.controller.js';
import { FleetService } from './fleet.service.js';
import { PrismaService } from '../../core/prisma/prisma.service.js';

@Module({ controllers: [FleetController], providers: [FleetService, PrismaService], exports: [FleetService] })
export class FleetModule {}
