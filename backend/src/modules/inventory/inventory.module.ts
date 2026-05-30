import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller.js';
import { InventoryService } from './inventory.service.js';
import { PrismaService } from '../../core/prisma/prisma.service.js';

// Stock sub-module
import { CostingService } from './stock/costing.service.js';
import { ValuationService } from './stock/valuation.service.js';
import { LandedCostService } from './stock/landed-cost.service.js';

@Module({
  controllers: [InventoryController],
  providers: [
    PrismaService,
    InventoryService,
    CostingService,
    ValuationService,
    LandedCostService,
  ],
  exports: [
    InventoryService,
    CostingService,
    ValuationService,
    LandedCostService,
  ],
})
export class InventoryModule {}
