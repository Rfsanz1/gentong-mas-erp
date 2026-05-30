import { Module } from '@nestjs/common';
import { CrmController } from './crm.controller.js';
import { CrmService } from './crm.service.js';
import { PrismaService } from '../../core/prisma/prisma.service.js';

@Module({ controllers: [CrmController], providers: [CrmService, PrismaService], exports: [CrmService] })
export class CrmModule {}
