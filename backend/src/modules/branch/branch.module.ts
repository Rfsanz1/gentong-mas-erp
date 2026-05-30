import { Module } from '@nestjs/common';
import { BranchController } from './branch.controller.js';
import { BranchService } from './branch.service.js';
import { PrismaService } from '../../core/prisma/prisma.service.js';

@Module({
  controllers: [BranchController],
  providers: [BranchService, PrismaService],
  exports: [BranchService],
})
export class BranchModule {}
