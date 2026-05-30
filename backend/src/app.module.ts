import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

// Core
import { PrismaService } from './core/prisma/prisma.service.js';
import { CanAccessGuard } from './core/guards/can-access.guard.js';
import { JwtAuthGuard } from './core/guards/jwt-auth.guard.js';
import { RouteRoleGuard } from './core/guards/route-role.guard.js';
import { AuditInterceptor } from './core/interceptors/audit.interceptor.js';
import { configuration } from './core/config/index.js';

// Feature modules
import { HealthModule } from './modules/health/health.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UserModule } from './modules/user/user.module.js';
import { RoleModule } from './modules/role/role.module.js';
import { NotificationModule } from './modules/notification/notification.module.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';
import { InventoryModule } from './modules/inventory/inventory.module.js';
import { SalesModule } from './modules/sales/sales.module.js';
import { PurchasingModule } from './modules/purchasing/purchasing.module.js';
import { CustomersModule } from './modules/customers/customers.module.js';
import { HrModule } from './modules/hr/hr.module.js';
import { FinanceModule } from './modules/finance/finance.module.js';
import { SettingsModule } from './modules/settings/settings.module.js';
import { DriverAreasModule } from './modules/driver-areas/driver-areas.module.js';
import { PosModule } from './modules/pos/pos.module.js';
import { CrmModule } from './modules/crm/crm.module.js';
import { ProjectModule } from './modules/project/project.module.js';
import { HelpdeskModule } from './modules/helpdesk/helpdesk.module.js';
import { ManufacturingModule } from './modules/manufacturing/manufacturing.module.js';
import { LeaveModule } from './modules/leave/leave.module.js';
import { RecruitmentModule } from './modules/recruitment/recruitment.module.js';
import { QualityModule } from './modules/quality/quality.module.js';
import { MaintenanceModule } from './modules/maintenance/maintenance.module.js';
import { FleetModule } from './modules/fleet/fleet.module.js';
import { TaxModule } from './modules/tax/tax.module.js';
import { PayrollModule } from './modules/payroll/payroll.module.js';
import { AssetModule } from './modules/asset/asset.module.js';
import { AuditModule } from './modules/audit/audit.module.js';
import { BranchModule } from './modules/branch/branch.module.js';

// Integrations
import { KledoModule } from './integrations/kledo/kledo.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    HttpModule,
    // System
    HealthModule,
    AuditModule,
    NotificationModule,
    // Auth & Users
    AuthModule,
    UserModule,
    RoleModule,
    // Core ERP
    InventoryModule,
    SalesModule,
    PurchasingModule,
    CustomersModule,
    FinanceModule,
    TaxModule,
    // HR & Payroll
    HrModule,
    PayrollModule,
    LeaveModule,
    RecruitmentModule,
    // Operations
    PosModule,
    AssetModule,
    ManufacturingModule,
    QualityModule,
    MaintenanceModule,
    FleetModule,
    // Relationships
    CrmModule,
    ProjectModule,
    HelpdeskModule,
    // Master Data
    BranchModule,
    DriverAreasModule,
    SettingsModule,
    DashboardModule,
    // Integrations
    KledoModule,
  ],
  providers: [
    PrismaService,
    CanAccessGuard,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RouteRoleGuard },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}
