import { Module } from '@nestjs/common';
import { HrController } from './hr.controller.js';
import { HrService } from './hr.service.js';
import { PrismaService } from '../../core/prisma/prisma.service.js';

@Module({ controllers: [HrController], providers: [HrService, PrismaService], exports: [HrService] })
export class HrModule {}
