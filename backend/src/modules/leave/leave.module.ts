import { Module } from '@nestjs/common';
import { LeaveController } from './leave.controller.js';
import { LeaveService } from './leave.service.js';
import { PrismaService } from '../../core/prisma/prisma.service.js';

@Module({ controllers: [LeaveController], providers: [LeaveService, PrismaService], exports: [LeaveService] })
export class LeaveModule {}
