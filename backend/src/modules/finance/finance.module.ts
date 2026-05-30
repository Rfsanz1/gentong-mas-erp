import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller.js';
import { FinanceService } from './finance.service.js';
import { PrismaService } from '../../core/prisma/prisma.service.js';

// Accounts sub-module
import { AccountService } from './accounts/account.service.js';
import { BudgetService } from './accounts/budget.service.js';
import { CreditLimitService } from './accounts/credit-limit.service.js';

// Journals sub-module
import { JournalService } from './journals/journal.service.js';
import { LedgerService } from './journals/ledger.service.js';
import { AutoJournalService } from './journals/auto-journal.service.js';

// Reports sub-module
import { FinancialReportService } from './reports/financial-report.service.js';

// Aging sub-module
import { ARAgingService } from './aging/ar-aging.service.js';
import { APAgingService } from './aging/ap-aging.service.js';

@Module({
  controllers: [FinanceController],
  providers: [
    PrismaService,
    FinanceService,
    // accounts/
    AccountService,
    BudgetService,
    CreditLimitService,
    // journals/
    JournalService,
    LedgerService,
    AutoJournalService,
    // reports/
    FinancialReportService,
    // aging/
    ARAgingService,
    APAgingService,
  ],
  exports: [
    FinanceService,
    AccountService,
    JournalService,
    LedgerService,
    FinancialReportService,
    AutoJournalService,
    ARAgingService,
    APAgingService,
    BudgetService,
    CreditLimitService,
  ],
})
export class FinanceModule {}
