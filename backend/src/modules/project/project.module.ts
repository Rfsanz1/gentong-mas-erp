import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller.js';
import { ProjectService } from './project.service.js';
import { PrismaService } from '../../core/prisma/prisma.service.js';

@Module({ controllers: [ProjectController], providers: [ProjectService, PrismaService], exports: [ProjectService] })
export class ProjectModule {}
