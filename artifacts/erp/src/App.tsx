import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/useAuthStore";
import { lazy, Suspense } from "react";

const queryClient = new QueryClient();

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F3FF' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-[#5B52D1] border-t-transparent animate-spin" />
        <p className="text-sm text-gray-500">Memuat...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const [location] = useLocation();
  if (!token) {
    return <Redirect to="/login" />;
  }
  return <>{children}</>;
}

const LoginPage = lazy(() => import("@/pages-next/login/page"));
const RootPage = lazy(() => import("@/pages-next/page"));
const DashboardPage = lazy(() => import("@/pages-next/dashboard/page"));
const NotificationsPage = lazy(() => import("@/pages-next/notifications/page"));
const AppsPage = lazy(() => import("@/pages-next/apps/page"));
const InstallPage = lazy(() => import("@/pages-next/install/page"));
const AccessPage = lazy(() => import("@/pages-next/access/page"));
const KledoPage = lazy(() => import("@/pages-next/kledo/page"));
const MonitoringPage = lazy(() => import("@/pages-next/monitoring/page"));
const SalesPage = lazy(() => import("@/pages-next/sales/page"));
const SalesQuotationsPage = lazy(() => import("@/pages-next/sales/quotations/page"));
const SalesOrdersPage = lazy(() => import("@/pages-next/sales/orders/page"));
const SalesProductsPage = lazy(() => import("@/pages-next/sales/products/page"));
const SalesReportsPage = lazy(() => import("@/pages-next/sales/reports/page"));
const SalesTeamsPage = lazy(() => import("@/pages-next/sales/teams/page"));
const SalesCommissionPage = lazy(() => import("@/pages-next/sales/commission/page"));
const SalesSettingsPage = lazy(() => import("@/pages-next/sales/settings/page"));
const SalesFakturPage = lazy(() => import("@/pages-next/sales/faktur/page"));
const SalesSmartOrderPage = lazy(() => import("@/pages-next/sales/smart-order/page"));
const CustomersPage = lazy(() => import("@/pages-next/customers/page"));
const CRMPage = lazy(() => import("@/pages-next/crm/page"));
const CRMLeadsPage = lazy(() => import("@/pages-next/crm/leads/page"));
const CRMPipelinePage = lazy(() => import("@/pages-next/crm/pipeline/page"));
const CRMOpportunitiesPage = lazy(() => import("@/pages-next/crm/opportunities/page"));
const CRMActivitiesPage = lazy(() => import("@/pages-next/crm/activities/page"));
const CRMReportsPage = lazy(() => import("@/pages-next/crm/reports/page"));
const CRMSettingsPage = lazy(() => import("@/pages-next/crm/settings/page"));
const InvoicePage = lazy(() => import("@/pages-next/invoice/page"));
const InvoicePaymentsPage = lazy(() => import("@/pages-next/invoice/payments/page"));
const InvoiceRecurringPage = lazy(() => import("@/pages-next/invoice/recurring/page"));
const InvoiceSettingsPage = lazy(() => import("@/pages-next/invoice/settings/page"));
const PurchasingPage = lazy(() => import("@/pages-next/purchasing/page"));
const PurchasingOrdersPage = lazy(() => import("@/pages-next/purchasing/purchase-orders/page"));
const PurchasingRFQPage = lazy(() => import("@/pages-next/purchasing/rfq/page"));
const PurchasingSuppliersPage = lazy(() => import("@/pages-next/purchasing/suppliers/page"));
const PurchasingGoodsReceiptsPage = lazy(() => import("@/pages-next/purchasing/goods-receipts/page"));
const PurchasingReportsPage = lazy(() => import("@/pages-next/purchasing/reports/page"));
const PurchasingSettingsPage = lazy(() => import("@/pages-next/purchasing/settings/page"));
const PurchasingPriceComparisonPage = lazy(() => import("@/pages-next/purchasing/price-comparison/page"));
const PurchasingApprovalMatrixPage = lazy(() => import("@/pages-next/purchasing/approval-matrix/page"));
const InventoryPage = lazy(() => import("@/pages-next/inventory/page").catch(() => ({ default: () => <PlaceholderPage title="Inventory" /> })));
const GudangPage = lazy(() => import("@/pages-next/gudang/page"));
const DeliveryPage = lazy(() => import("@/pages-next/delivery/page"));
const DriverPage = lazy(() => import("@/pages-next/driver/page"));
const FleetPage = lazy(() => import("@/pages-next/fleet/page"));
const FleetVehiclesPage = lazy(() => import("@/pages-next/fleet/vehicles/page"));
const FleetRemindersPage = lazy(() => import("@/pages-next/fleet/reminders/page"));
const FleetFuelTrackingPage = lazy(() => import("@/pages-next/fleet/fuel-tracking/page"));
const FinancePage = lazy(() => import("@/pages-next/finance/page").catch(() => ({ default: () => <PlaceholderPage title="Finance" /> })));
const FinanceReportsPage = lazy(() => import("@/pages-next/finance/reports/page").catch(() => ({ default: () => <PlaceholderPage title="Finance Reports" /> })));
const AccountingPage = lazy(() => import("@/pages-next/accounting/page"));
const ManufacturingPage = lazy(() => import("@/pages-next/manufacturing/page"));
const ManufacturingMRPPage = lazy(() => import("@/pages-next/manufacturing/mrp/page"));
const ManufacturingScrapPage = lazy(() => import("@/pages-next/manufacturing/scrap/page"));
const MarketplacePage = lazy(() => import("@/pages-next/marketplace/page"));
const MarketplacePriceSyncPage = lazy(() => import("@/pages-next/marketplace/price-sync/page"));
const MarketplaceStockReservationPage = lazy(() => import("@/pages-next/marketplace/stock-reservation/page"));
const HRPage = lazy(() => import("@/pages-next/hr/page").catch(() => ({ default: () => <PlaceholderPage title="HR" /> })));
const PayrollPage = lazy(() => import("@/pages-next/payroll/page").catch(() => ({ default: () => <PlaceholderPage title="Payroll" /> })));
const RecruitmentPage = lazy(() => import("@/pages-next/recruitment/page"));
const RecruitmentApplicationsPage = lazy(() => import("@/pages-next/recruitment/applications/page"));
const RecruitmentPositionsPage = lazy(() => import("@/pages-next/recruitment/positions/page"));
const ReportsPage = lazy(() => import("@/pages-next/reports/page"));
const ReportsSalesPage = lazy(() => import("@/pages-next/reports/sales/page"));
const ReportsFinancePage = lazy(() => import("@/pages-next/reports/finance/page"));
const ReportsHRPage = lazy(() => import("@/pages-next/reports/hr/page"));
const ReportsInventoryPage = lazy(() => import("@/pages-next/reports/inventory/page"));
const ReportsPurchasingPage = lazy(() => import("@/pages-next/reports/purchasing/page"));
const AIPage = lazy(() => import("@/pages-next/ai/page"));
const AIChatbotPage = lazy(() => import("@/pages-next/ai/chatbot/page"));
const AIForecastPage = lazy(() => import("@/pages-next/ai/forecast/page"));
const AIRecommendationPage = lazy(() => import("@/pages-next/ai/recommendation/page"));
const AIAutomationPage = lazy(() => import("@/pages-next/ai/automation/page"));
const AIReportGeneratorPage = lazy(() => import("@/pages-next/ai/report-generator/page"));
const AISalesPredictionPage = lazy(() => import("@/pages-next/ai/sales-prediction/page"));
const AIInventoryPredictionPage = lazy(() => import("@/pages-next/ai/inventory-prediction/page"));
const AIFinancialAnalysisPage = lazy(() => import("@/pages-next/ai/financial-analysis/page"));
const AIHRAssistantPage = lazy(() => import("@/pages-next/ai/hr-assistant/page"));
const AIMarketplaceAssistantPage = lazy(() => import("@/pages-next/ai/marketplace-assistant/page"));
const AINotificationsPage = lazy(() => import("@/pages-next/ai/notifications/page"));
const AILogsPage = lazy(() => import("@/pages-next/ai/logs/page"));
const AIAnalyticsPage = lazy(() => import("@/pages-next/ai/analytics/page"));
const SettingsPage = lazy(() => import("@/pages-next/settings/page"));
const SettingsUsersPage = lazy(() => import("@/pages-next/settings/users/page"));
const SettingsRolesPage = lazy(() => import("@/pages-next/settings/roles/page"));
const SettingsCompaniesPage = lazy(() => import("@/pages-next/settings/companies/page"));
const POSPage = lazy(() => import("@/pages-next/pos/page"));
const ServicePage = lazy(() => import("@/pages-next/service/page"));
const MaintenancePage = lazy(() => import("@/pages-next/maintenance/page"));
const MarketingPage = lazy(() => import("@/pages-next/marketing/page"));
const QualityPage = lazy(() => import("@/pages-next/quality/page"));
const ProductivityPage = lazy(() => import("@/pages-next/productivity/page"));
const ProjectPage = lazy(() => import("@/pages-next/project/page"));
const WebsitePage = lazy(() => import("@/pages-next/website/page"));
const EcommercePage = lazy(() => import("@/pages-next/ecommerce/page"));
const IntegrationsPage = lazy(() => import("@/pages-next/integrations/page"));
const TaxPage = lazy(() => import("@/pages-next/tax/page"));
const ReportsCustomersPage = lazy(() => import("@/pages-next/reports/customers/page").catch(() => ({ default: () => <PlaceholderPage title="Reports - Customers" /> })));
const AccountingChartOfAccountsPage = lazy(() => import("@/pages-next/accounting/chart-of-accounts/page").catch(() => ({ default: () => <PlaceholderPage title="Chart of Accounts" /> })));
const AccountingGeneralLedgerPage = lazy(() => import("@/pages-next/accounting/general-ledger/page").catch(() => ({ default: () => <PlaceholderPage title="General Ledger" /> })));
const AccountingJournalEntryPage = lazy(() => import("@/pages-next/accounting/journal-entry/page").catch(() => ({ default: () => <PlaceholderPage title="Journal Entry" /> })));
const AccountingReportsPage = lazy(() => import("@/pages-next/accounting/reports/page").catch(() => ({ default: () => <PlaceholderPage title="Accounting Reports" /> })));
const AccountingSettingsPage = lazy(() => import("@/pages-next/accounting/settings/page").catch(() => ({ default: () => <PlaceholderPage title="Accounting Settings" /> })));
const AccountingTrialBalancePage = lazy(() => import("@/pages-next/accounting/trial-balance/page").catch(() => ({ default: () => <PlaceholderPage title="Trial Balance" /> })));
const AIInventoryPage = lazy(() => import("@/pages-next/ai/inventory/page").catch(() => ({ default: () => <PlaceholderPage title="AI Inventory" /> })));
const CustomersLoyaltyPage = lazy(() => import("@/pages-next/customers/loyalty/page").catch(() => ({ default: () => <PlaceholderPage title="Customers Loyalty" /> })));
const CustomersWhatsappLogPage = lazy(() => import("@/pages-next/customers/whatsapp-log/page").catch(() => ({ default: () => <PlaceholderPage title="WhatsApp Log" /> })));
const DeliveryAreasPage = lazy(() => import("@/pages-next/delivery/areas/page").catch(() => ({ default: () => <PlaceholderPage title="Delivery Areas" /> })));
const DeliverySettingsPage = lazy(() => import("@/pages-next/delivery/settings/page").catch(() => ({ default: () => <PlaceholderPage title="Delivery Settings" /> })));
const FinanceAgedPayablePage = lazy(() => import("@/pages-next/finance/aged-payable/page").catch(() => ({ default: () => <PlaceholderPage title="Aged Payable" /> })));
const FinanceAgedReceivablePage = lazy(() => import("@/pages-next/finance/aged-receivable/page").catch(() => ({ default: () => <PlaceholderPage title="Aged Receivable" /> })));
const FinanceBankAccountsPage = lazy(() => import("@/pages-next/finance/bank-accounts/page").catch(() => ({ default: () => <PlaceholderPage title="Bank Accounts" /> })));
const FinanceBankReconciliationPage = lazy(() => import("@/pages-next/finance/bank-reconciliation/page").catch(() => ({ default: () => <PlaceholderPage title="Bank Reconciliation" /> })));
const FinanceBudgetPage = lazy(() => import("@/pages-next/finance/budget/page").catch(() => ({ default: () => <PlaceholderPage title="Budget" /> })));
const FinanceCashPage = lazy(() => import("@/pages-next/finance/cash/page").catch(() => ({ default: () => <PlaceholderPage title="Cash" /> })));
const FinanceCoaPage = lazy(() => import("@/pages-next/finance/coa/page").catch(() => ({ default: () => <PlaceholderPage title="Chart of Accounts" /> })));
const FinanceCreditLimitPage = lazy(() => import("@/pages-next/finance/credit-limit/page").catch(() => ({ default: () => <PlaceholderPage title="Credit Limit" /> })));
const FinanceCurrenciesPage = lazy(() => import("@/pages-next/finance/currencies/page").catch(() => ({ default: () => <PlaceholderPage title="Currencies" /> })));
const FinanceExpensesPage = lazy(() => import("@/pages-next/finance/expenses/page").catch(() => ({ default: () => <PlaceholderPage title="Expenses" /> })));
const FinanceFixedAssetsPage = lazy(() => import("@/pages-next/finance/fixed-assets/page").catch(() => ({ default: () => <PlaceholderPage title="Fixed Assets" /> })));
const FinanceJournalEntriesPage = lazy(() => import("@/pages-next/finance/journal-entries/page").catch(() => ({ default: () => <PlaceholderPage title="Journal Entries" /> })));
const FinanceTaxConfigPage = lazy(() => import("@/pages-next/finance/tax-config/page").catch(() => ({ default: () => <PlaceholderPage title="Tax Config" /> })));
const GudangSectionPage = lazy(() => import("@/pages-next/gudang/[section]/page").catch(() => ({ default: () => <PlaceholderPage title="Gudang" /> })));
const HelpdeskPage = lazy(() => import("@/pages-next/helpdesk/page").catch(() => ({ default: () => <PlaceholderPage title="Helpdesk" /> })));
const HRAppraisalsPage = lazy(() => import("@/pages-next/hr/appraisals/page").catch(() => ({ default: () => <PlaceholderPage title="HR Appraisals" /> })));
const HRAttendancesPage = lazy(() => import("@/pages-next/hr/attendances/page").catch(() => ({ default: () => <PlaceholderPage title="HR Attendances" /> })));
const HRBPJSPage = lazy(() => import("@/pages-next/hr/bpjs/page").catch(() => ({ default: () => <PlaceholderPage title="HR BPJS" /> })));
const HREmployeesPage = lazy(() => import("@/pages-next/hr/employees/page").catch(() => ({ default: () => <PlaceholderPage title="HR Employees" /> })));
const HRFleetPage = lazy(() => import("@/pages-next/hr/fleet/page").catch(() => ({ default: () => <PlaceholderPage title="HR Fleet" /> })));
const HRLeavesPage = lazy(() => import("@/pages-next/hr/leaves/page").catch(() => ({ default: () => <PlaceholderPage title="HR Leaves" /> })));
const HRLoansPage = lazy(() => import("@/pages-next/hr/loans/page").catch(() => ({ default: () => <PlaceholderPage title="HR Loans" /> })));
const HROrganizationPage = lazy(() => import("@/pages-next/hr/organization/page").catch(() => ({ default: () => <PlaceholderPage title="HR Organization" /> })));
const HRPayrollsBankExportPage = lazy(() => import("@/pages-next/hr/payrolls/bank-export/page").catch(() => ({ default: () => <PlaceholderPage title="Bank Export" /> })));
const HRPayrollsBatchPage = lazy(() => import("@/pages-next/hr/payrolls/batch/page").catch(() => ({ default: () => <PlaceholderPage title="Payroll Batch" /> })));
const HRPayrollsBpjsCalcPage = lazy(() => import("@/pages-next/hr/payrolls/bpjs-calc/page").catch(() => ({ default: () => <PlaceholderPage title="BPJS Calc" /> })));
const HRPayrollsComponentsPage = lazy(() => import("@/pages-next/hr/payrolls/components/page").catch(() => ({ default: () => <PlaceholderPage title="Payroll Components" /> })));
const HRPayrollsHistoryPage = lazy(() => import("@/pages-next/hr/payrolls/history/page").catch(() => ({ default: () => <PlaceholderPage title="Payroll History" /> })));
const HRPayrollsPage = lazy(() => import("@/pages-next/hr/payrolls/page").catch(() => ({ default: () => <PlaceholderPage title="Payrolls" /> })));
const HRPayrollsPeriodsPage = lazy(() => import("@/pages-next/hr/payrolls/periods/page").catch(() => ({ default: () => <PlaceholderPage title="Payroll Periods" /> })));
const HRPayrollsPph21CalcPage = lazy(() => import("@/pages-next/hr/payrolls/pph21-calc/page").catch(() => ({ default: () => <PlaceholderPage title="PPh21 Calc" /> })));
const HRPayrollsReportsPage = lazy(() => import("@/pages-next/hr/payrolls/reports/page").catch(() => ({ default: () => <PlaceholderPage title="Payroll Reports" /> })));
const HRPayrollsSettingsPage = lazy(() => import("@/pages-next/hr/payrolls/settings/page").catch(() => ({ default: () => <PlaceholderPage title="Payroll Settings" /> })));
const HRPayrollsSlipsPage = lazy(() => import("@/pages-next/hr/payrolls/slips/page").catch(() => ({ default: () => <PlaceholderPage title="Payroll Slips" /> })));
const HRRecruitmentPage = lazy(() => import("@/pages-next/hr/recruitment/page").catch(() => ({ default: () => <PlaceholderPage title="HR Recruitment" /> })));
const HRSettingsPage = lazy(() => import("@/pages-next/hr/settings/page").catch(() => ({ default: () => <PlaceholderPage title="HR Settings" /> })));
const HRTrainingPage = lazy(() => import("@/pages-next/hr/training/page").catch(() => ({ default: () => <PlaceholderPage title="HR Training" /> })));
const IntegrationsKledoPage = lazy(() => import("@/pages-next/integrations/kledo/page").catch(() => ({ default: () => <PlaceholderPage title="Kledo Integration" /> })));
const InventoryDeliveriesPage = lazy(() => import("@/pages-next/inventory/deliveries/page").catch(() => ({ default: () => <PlaceholderPage title="Inventory Deliveries" /> })));
const InventoryLandedCostPage = lazy(() => import("@/pages-next/inventory/landed-cost/page").catch(() => ({ default: () => <PlaceholderPage title="Landed Cost" /> })));
const InventoryLotTrackingPage = lazy(() => import("@/pages-next/inventory/lot-tracking/page").catch(() => ({ default: () => <PlaceholderPage title="Lot Tracking" /> })));
const InventoryLotsPage = lazy(() => import("@/pages-next/inventory/lots/page").catch(() => ({ default: () => <PlaceholderPage title="Inventory Lots" /> })));
const InventoryProductsCategoriesPage = lazy(() => import("@/pages-next/inventory/products/categories/page").catch(() => ({ default: () => <PlaceholderPage title="Product Categories" /> })));
const InventoryProductsPage = lazy(() => import("@/pages-next/inventory/products/page").catch(() => ({ default: () => <PlaceholderPage title="Inventory Products" /> })));
const InventoryReorderRulesPage = lazy(() => import("@/pages-next/inventory/reorder-rules/page").catch(() => ({ default: () => <PlaceholderPage title="Reorder Rules" /> })));
const InventorySettingsPage = lazy(() => import("@/pages-next/inventory/settings/page").catch(() => ({ default: () => <PlaceholderPage title="Inventory Settings" /> })));
const InventoryStockAgingPage = lazy(() => import("@/pages-next/inventory/stock-aging/page").catch(() => ({ default: () => <PlaceholderPage title="Stock Aging" /> })));
const InventoryStockMovementsPage = lazy(() => import("@/pages-next/inventory/stock-movements/page").catch(() => ({ default: () => <PlaceholderPage title="Stock Movements" /> })));
const InventoryStockOpnamesPage = lazy(() => import("@/pages-next/inventory/stock-opnames/page").catch(() => ({ default: () => <PlaceholderPage title="Stock Opnames" /> })));
const InventoryStockValuationPage = lazy(() => import("@/pages-next/inventory/stock-valuation/page").catch(() => ({ default: () => <PlaceholderPage title="Stock Valuation" /> })));
const InventoryTransfersPage = lazy(() => import("@/pages-next/inventory/transfers/page").catch(() => ({ default: () => <PlaceholderPage title="Inventory Transfers" /> })));
const InventoryWarehousesPage = lazy(() => import("@/pages-next/inventory/warehouses/page").catch(() => ({ default: () => <PlaceholderPage title="Warehouses" /> })));
const InvoiceAgingPage = lazy(() => import("@/pages-next/invoice/aging/page").catch(() => ({ default: () => <PlaceholderPage title="Invoice Aging" /> })));
const InvoiceCreditNotesPage = lazy(() => import("@/pages-next/invoice/credit-notes/page").catch(() => ({ default: () => <PlaceholderPage title="Credit Notes" /> })));
const InvoiceDownPaymentPage = lazy(() => import("@/pages-next/invoice/down-payment/page").catch(() => ({ default: () => <PlaceholderPage title="Down Payment" /> })));
const InvoiceListPage = lazy(() => import("@/pages-next/invoice/list/page").catch(() => ({ default: () => <PlaceholderPage title="Invoice List" /> })));
const MonitoringDriverPage = lazy(() => import("@/pages-next/monitoring/driver/page").catch(() => ({ default: () => <PlaceholderPage title="Driver Monitoring" /> })));
const MonitoringGudangPage = lazy(() => import("@/pages-next/monitoring/gudang/page").catch(() => ({ default: () => <PlaceholderPage title="Gudang Monitoring" /> })));
const MonitoringPosPage = lazy(() => import("@/pages-next/monitoring/pos/page").catch(() => ({ default: () => <PlaceholderPage title="POS Monitoring" /> })));
const MonitoringSalesPage = lazy(() => import("@/pages-next/monitoring/sales/page").catch(() => ({ default: () => <PlaceholderPage title="Sales Monitoring" /> })));
const POSCashierPage = lazy(() => import("@/pages-next/pos/cashier/page").catch(() => ({ default: () => <PlaceholderPage title="POS Cashier" /> })));
const POSOrdersPage = lazy(() => import("@/pages-next/pos/orders/page").catch(() => ({ default: () => <PlaceholderPage title="POS Orders" /> })));
const POSProductsPage = lazy(() => import("@/pages-next/pos/products/page").catch(() => ({ default: () => <PlaceholderPage title="POS Products" /> })));
const POSReportsPage = lazy(() => import("@/pages-next/pos/reports/page").catch(() => ({ default: () => <PlaceholderPage title="POS Reports" /> })));
const POSSessionsPage = lazy(() => import("@/pages-next/pos/sessions/page").catch(() => ({ default: () => <PlaceholderPage title="POS Sessions" /> })));
const POSSettingsPage = lazy(() => import("@/pages-next/pos/settings/page").catch(() => ({ default: () => <PlaceholderPage title="POS Settings" /> })));
const PurchasingNewOrderPage = lazy(() => import("@/pages-next/purchasing/purchase-orders/new/page").catch(() => ({ default: () => <PlaceholderPage title="New Purchase Order" /> })));
const ServiceEstimatesPage = lazy(() => import("@/pages-next/service/estimates/page").catch(() => ({ default: () => <PlaceholderPage title="Service Estimates" /> })));
const ServiceWorkOrdersPage = lazy(() => import("@/pages-next/service/work-orders/page").catch(() => ({ default: () => <PlaceholderPage title="Work Orders" /> })));
const SettingsActivityLogPage = lazy(() => import("@/pages-next/settings/activity-log/page").catch(() => ({ default: () => <PlaceholderPage title="Activity Log" /> })));
const SettingsApiIntegrationPage = lazy(() => import("@/pages-next/settings/api-integration/page").catch(() => ({ default: () => <PlaceholderPage title="API Integration" /> })));
const SettingsAuditLogPage = lazy(() => import("@/pages-next/settings/audit-log/page").catch(() => ({ default: () => <PlaceholderPage title="Audit Log" /> })));
const SettingsBackupPage = lazy(() => import("@/pages-next/settings/backup/page").catch(() => ({ default: () => <PlaceholderPage title="Backup" /> })));
const SettingsDocumentNumbersPage = lazy(() => import("@/pages-next/settings/document-numbers/page").catch(() => ({ default: () => <PlaceholderPage title="Document Numbers" /> })));
const SettingsEmailGatewayPage = lazy(() => import("@/pages-next/settings/email-gateway/page").catch(() => ({ default: () => <PlaceholderPage title="Email Gateway" /> })));
const SettingsWaGatewayPage = lazy(() => import("@/pages-next/settings/wa-gateway/page").catch(() => ({ default: () => <PlaceholderPage title="WhatsApp Gateway" /> })));
const TaxEfakturPage = lazy(() => import("@/pages-next/tax/efaktur/page").catch(() => ({ default: () => <PlaceholderPage title="e-Faktur" /> })));
const TaxRekapPpnPage = lazy(() => import("@/pages-next/tax/rekap-ppn/page").catch(() => ({ default: () => <PlaceholderPage title="Rekap PPN" /> })));
const TaxSetupPage = lazy(() => import("@/pages-next/tax/setup/page").catch(() => ({ default: () => <PlaceholderPage title="Tax Setup" /> })));

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-6">
      <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center">
        <p className="text-lg font-semibold text-gray-400">{title}</p>
        <p className="mt-1 text-sm text-gray-400">Halaman ini sedang dalam pengembangan.</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/">
          <ProtectedRoute><RootPage /></ProtectedRoute>
        </Route>
        <Route path="/dashboard">
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        </Route>
        <Route path="/notifications">
          <ProtectedRoute><NotificationsPage /></ProtectedRoute>
        </Route>
        <Route path="/apps">
          <ProtectedRoute><AppsPage /></ProtectedRoute>
        </Route>
        <Route path="/install">
          <ProtectedRoute><InstallPage /></ProtectedRoute>
        </Route>
        <Route path="/access">
          <ProtectedRoute><AccessPage /></ProtectedRoute>
        </Route>
        <Route path="/kledo">
          <ProtectedRoute><KledoPage /></ProtectedRoute>
        </Route>
        <Route path="/monitoring">
          <ProtectedRoute><MonitoringPage /></ProtectedRoute>
        </Route>
        <Route path="/sales">
          <ProtectedRoute><SalesPage /></ProtectedRoute>
        </Route>
        <Route path="/sales/quotations">
          <ProtectedRoute><SalesQuotationsPage /></ProtectedRoute>
        </Route>
        <Route path="/sales/orders">
          <ProtectedRoute><SalesOrdersPage /></ProtectedRoute>
        </Route>
        <Route path="/sales/products">
          <ProtectedRoute><SalesProductsPage /></ProtectedRoute>
        </Route>
        <Route path="/sales/reports">
          <ProtectedRoute><SalesReportsPage /></ProtectedRoute>
        </Route>
        <Route path="/sales/teams">
          <ProtectedRoute><SalesTeamsPage /></ProtectedRoute>
        </Route>
        <Route path="/sales/commission">
          <ProtectedRoute><SalesCommissionPage /></ProtectedRoute>
        </Route>
        <Route path="/sales/settings">
          <ProtectedRoute><SalesSettingsPage /></ProtectedRoute>
        </Route>
        <Route path="/sales/faktur">
          <ProtectedRoute><SalesFakturPage /></ProtectedRoute>
        </Route>
        <Route path="/sales/smart-order">
          <ProtectedRoute><SalesSmartOrderPage /></ProtectedRoute>
        </Route>
        <Route path="/customers">
          <ProtectedRoute><CustomersPage /></ProtectedRoute>
        </Route>
        <Route path="/crm">
          <ProtectedRoute><CRMPage /></ProtectedRoute>
        </Route>
        <Route path="/crm/leads">
          <ProtectedRoute><CRMLeadsPage /></ProtectedRoute>
        </Route>
        <Route path="/crm/pipeline">
          <ProtectedRoute><CRMPipelinePage /></ProtectedRoute>
        </Route>
        <Route path="/crm/opportunities">
          <ProtectedRoute><CRMOpportunitiesPage /></ProtectedRoute>
        </Route>
        <Route path="/crm/activities">
          <ProtectedRoute><CRMActivitiesPage /></ProtectedRoute>
        </Route>
        <Route path="/crm/reports">
          <ProtectedRoute><CRMReportsPage /></ProtectedRoute>
        </Route>
        <Route path="/crm/settings">
          <ProtectedRoute><CRMSettingsPage /></ProtectedRoute>
        </Route>
        <Route path="/invoice">
          <ProtectedRoute><InvoicePage /></ProtectedRoute>
        </Route>
        <Route path="/invoice/payments">
          <ProtectedRoute><InvoicePaymentsPage /></ProtectedRoute>
        </Route>
        <Route path="/invoice/recurring">
          <ProtectedRoute><InvoiceRecurringPage /></ProtectedRoute>
        </Route>
        <Route path="/invoice/settings">
          <ProtectedRoute><InvoiceSettingsPage /></ProtectedRoute>
        </Route>
        <Route path="/purchasing">
          <ProtectedRoute><PurchasingPage /></ProtectedRoute>
        </Route>
        <Route path="/purchasing/purchase-orders">
          <ProtectedRoute><PurchasingOrdersPage /></ProtectedRoute>
        </Route>
        <Route path="/purchasing/rfq">
          <ProtectedRoute><PurchasingRFQPage /></ProtectedRoute>
        </Route>
        <Route path="/purchasing/suppliers">
          <ProtectedRoute><PurchasingSuppliersPage /></ProtectedRoute>
        </Route>
        <Route path="/purchasing/goods-receipts">
          <ProtectedRoute><PurchasingGoodsReceiptsPage /></ProtectedRoute>
        </Route>
        <Route path="/purchasing/reports">
          <ProtectedRoute><PurchasingReportsPage /></ProtectedRoute>
        </Route>
        <Route path="/purchasing/settings">
          <ProtectedRoute><PurchasingSettingsPage /></ProtectedRoute>
        </Route>
        <Route path="/purchasing/price-comparison">
          <ProtectedRoute><PurchasingPriceComparisonPage /></ProtectedRoute>
        </Route>
        <Route path="/purchasing/approval-matrix">
          <ProtectedRoute><PurchasingApprovalMatrixPage /></ProtectedRoute>
        </Route>
        <Route path="/inventory">
          <ProtectedRoute><InventoryPage /></ProtectedRoute>
        </Route>
        <Route path="/gudang">
          <ProtectedRoute><GudangPage /></ProtectedRoute>
        </Route>
        <Route path="/delivery">
          <ProtectedRoute><DeliveryPage /></ProtectedRoute>
        </Route>
        <Route path="/driver">
          <ProtectedRoute><DriverPage /></ProtectedRoute>
        </Route>
        <Route path="/fleet">
          <ProtectedRoute><FleetPage /></ProtectedRoute>
        </Route>
        <Route path="/fleet/vehicles">
          <ProtectedRoute><FleetVehiclesPage /></ProtectedRoute>
        </Route>
        <Route path="/fleet/reminders">
          <ProtectedRoute><FleetRemindersPage /></ProtectedRoute>
        </Route>
        <Route path="/fleet/fuel-tracking">
          <ProtectedRoute><FleetFuelTrackingPage /></ProtectedRoute>
        </Route>
        <Route path="/finance">
          <ProtectedRoute><FinancePage /></ProtectedRoute>
        </Route>
        <Route path="/finance/reports">
          <ProtectedRoute><FinanceReportsPage /></ProtectedRoute>
        </Route>
        <Route path="/accounting">
          <ProtectedRoute><AccountingPage /></ProtectedRoute>
        </Route>
        <Route path="/manufacturing">
          <ProtectedRoute><ManufacturingPage /></ProtectedRoute>
        </Route>
        <Route path="/manufacturing/mrp">
          <ProtectedRoute><ManufacturingMRPPage /></ProtectedRoute>
        </Route>
        <Route path="/manufacturing/scrap">
          <ProtectedRoute><ManufacturingScrapPage /></ProtectedRoute>
        </Route>
        <Route path="/marketplace">
          <ProtectedRoute><MarketplacePage /></ProtectedRoute>
        </Route>
        <Route path="/marketplace/price-sync">
          <ProtectedRoute><MarketplacePriceSyncPage /></ProtectedRoute>
        </Route>
        <Route path="/marketplace/stock-reservation">
          <ProtectedRoute><MarketplaceStockReservationPage /></ProtectedRoute>
        </Route>
        <Route path="/hr">
          <ProtectedRoute><HRPage /></ProtectedRoute>
        </Route>
        <Route path="/payroll">
          <ProtectedRoute><PayrollPage /></ProtectedRoute>
        </Route>
        <Route path="/recruitment">
          <ProtectedRoute><RecruitmentPage /></ProtectedRoute>
        </Route>
        <Route path="/recruitment/applications">
          <ProtectedRoute><RecruitmentApplicationsPage /></ProtectedRoute>
        </Route>
        <Route path="/recruitment/positions">
          <ProtectedRoute><RecruitmentPositionsPage /></ProtectedRoute>
        </Route>
        <Route path="/reports">
          <ProtectedRoute><ReportsPage /></ProtectedRoute>
        </Route>
        <Route path="/reports/sales">
          <ProtectedRoute><ReportsSalesPage /></ProtectedRoute>
        </Route>
        <Route path="/reports/finance">
          <ProtectedRoute><ReportsFinancePage /></ProtectedRoute>
        </Route>
        <Route path="/reports/hr">
          <ProtectedRoute><ReportsHRPage /></ProtectedRoute>
        </Route>
        <Route path="/reports/inventory">
          <ProtectedRoute><ReportsInventoryPage /></ProtectedRoute>
        </Route>
        <Route path="/reports/purchasing">
          <ProtectedRoute><ReportsPurchasingPage /></ProtectedRoute>
        </Route>
        <Route path="/reports/customers">
          <ProtectedRoute><ReportsCustomersPage /></ProtectedRoute>
        </Route>
        <Route path="/ai">
          <ProtectedRoute><AIPage /></ProtectedRoute>
        </Route>
        <Route path="/ai/chatbot">
          <ProtectedRoute><AIChatbotPage /></ProtectedRoute>
        </Route>
        <Route path="/ai/forecast">
          <ProtectedRoute><AIForecastPage /></ProtectedRoute>
        </Route>
        <Route path="/ai/recommendation">
          <ProtectedRoute><AIRecommendationPage /></ProtectedRoute>
        </Route>
        <Route path="/ai/automation">
          <ProtectedRoute><AIAutomationPage /></ProtectedRoute>
        </Route>
        <Route path="/ai/report-generator">
          <ProtectedRoute><AIReportGeneratorPage /></ProtectedRoute>
        </Route>
        <Route path="/ai/sales-prediction">
          <ProtectedRoute><AISalesPredictionPage /></ProtectedRoute>
        </Route>
        <Route path="/ai/inventory-prediction">
          <ProtectedRoute><AIInventoryPredictionPage /></ProtectedRoute>
        </Route>
        <Route path="/ai/financial-analysis">
          <ProtectedRoute><AIFinancialAnalysisPage /></ProtectedRoute>
        </Route>
        <Route path="/ai/hr-assistant">
          <ProtectedRoute><AIHRAssistantPage /></ProtectedRoute>
        </Route>
        <Route path="/ai/marketplace-assistant">
          <ProtectedRoute><AIMarketplaceAssistantPage /></ProtectedRoute>
        </Route>
        <Route path="/ai/notifications">
          <ProtectedRoute><AINotificationsPage /></ProtectedRoute>
        </Route>
        <Route path="/ai/logs">
          <ProtectedRoute><AILogsPage /></ProtectedRoute>
        </Route>
        <Route path="/ai/analytics">
          <ProtectedRoute><AIAnalyticsPage /></ProtectedRoute>
        </Route>
        <Route path="/settings">
          <ProtectedRoute><SettingsPage /></ProtectedRoute>
        </Route>
        <Route path="/settings/users">
          <ProtectedRoute><SettingsUsersPage /></ProtectedRoute>
        </Route>
        <Route path="/settings/roles">
          <ProtectedRoute><SettingsRolesPage /></ProtectedRoute>
        </Route>
        <Route path="/settings/companies">
          <ProtectedRoute><SettingsCompaniesPage /></ProtectedRoute>
        </Route>
        <Route path="/pos">
          <ProtectedRoute><POSPage /></ProtectedRoute>
        </Route>
        <Route path="/service">
          <ProtectedRoute><ServicePage /></ProtectedRoute>
        </Route>
        <Route path="/maintenance">
          <ProtectedRoute><MaintenancePage /></ProtectedRoute>
        </Route>
        <Route path="/marketing">
          <ProtectedRoute><MarketingPage /></ProtectedRoute>
        </Route>
        <Route path="/quality">
          <ProtectedRoute><QualityPage /></ProtectedRoute>
        </Route>
        <Route path="/productivity">
          <ProtectedRoute><ProductivityPage /></ProtectedRoute>
        </Route>
        <Route path="/project">
          <ProtectedRoute><ProjectPage /></ProtectedRoute>
        </Route>
        <Route path="/website">
          <ProtectedRoute><WebsitePage /></ProtectedRoute>
        </Route>
        <Route path="/ecommerce">
          <ProtectedRoute><EcommercePage /></ProtectedRoute>
        </Route>
        <Route path="/integrations">
          <ProtectedRoute><IntegrationsPage /></ProtectedRoute>
        </Route>
        <Route path="/tax">
          <ProtectedRoute><TaxPage /></ProtectedRoute>
        </Route>
        <Route path="/accounting/chart-of-accounts">
          <ProtectedRoute><AccountingChartOfAccountsPage /></ProtectedRoute>
        </Route>
        <Route path="/accounting/general-ledger">
          <ProtectedRoute><AccountingGeneralLedgerPage /></ProtectedRoute>
        </Route>
        <Route path="/accounting/journal-entry">
          <ProtectedRoute><AccountingJournalEntryPage /></ProtectedRoute>
        </Route>
        <Route path="/accounting/reports">
          <ProtectedRoute><AccountingReportsPage /></ProtectedRoute>
        </Route>
        <Route path="/accounting/settings">
          <ProtectedRoute><AccountingSettingsPage /></ProtectedRoute>
        </Route>
        <Route path="/accounting/trial-balance">
          <ProtectedRoute><AccountingTrialBalancePage /></ProtectedRoute>
        </Route>
        <Route path="/ai/inventory">
          <ProtectedRoute><AIInventoryPage /></ProtectedRoute>
        </Route>
        <Route path="/customers/loyalty">
          <ProtectedRoute><CustomersLoyaltyPage /></ProtectedRoute>
        </Route>
        <Route path="/customers/whatsapp-log">
          <ProtectedRoute><CustomersWhatsappLogPage /></ProtectedRoute>
        </Route>
        <Route path="/delivery/areas">
          <ProtectedRoute><DeliveryAreasPage /></ProtectedRoute>
        </Route>
        <Route path="/delivery/settings">
          <ProtectedRoute><DeliverySettingsPage /></ProtectedRoute>
        </Route>
        <Route path="/finance/aged-payable">
          <ProtectedRoute><FinanceAgedPayablePage /></ProtectedRoute>
        </Route>
        <Route path="/finance/aged-receivable">
          <ProtectedRoute><FinanceAgedReceivablePage /></ProtectedRoute>
        </Route>
        <Route path="/finance/bank-accounts">
          <ProtectedRoute><FinanceBankAccountsPage /></ProtectedRoute>
        </Route>
        <Route path="/finance/bank-reconciliation">
          <ProtectedRoute><FinanceBankReconciliationPage /></ProtectedRoute>
        </Route>
        <Route path="/finance/budget">
          <ProtectedRoute><FinanceBudgetPage /></ProtectedRoute>
        </Route>
        <Route path="/finance/cash">
          <ProtectedRoute><FinanceCashPage /></ProtectedRoute>
        </Route>
        <Route path="/finance/coa">
          <ProtectedRoute><FinanceCoaPage /></ProtectedRoute>
        </Route>
        <Route path="/finance/credit-limit">
          <ProtectedRoute><FinanceCreditLimitPage /></ProtectedRoute>
        </Route>
        <Route path="/finance/currencies">
          <ProtectedRoute><FinanceCurrenciesPage /></ProtectedRoute>
        </Route>
        <Route path="/finance/expenses">
          <ProtectedRoute><FinanceExpensesPage /></ProtectedRoute>
        </Route>
        <Route path="/finance/fixed-assets">
          <ProtectedRoute><FinanceFixedAssetsPage /></ProtectedRoute>
        </Route>
        <Route path="/finance/journal-entries">
          <ProtectedRoute><FinanceJournalEntriesPage /></ProtectedRoute>
        </Route>
        <Route path="/finance/tax-config">
          <ProtectedRoute><FinanceTaxConfigPage /></ProtectedRoute>
        </Route>
        <Route path="/gudang/:section">
          <ProtectedRoute><GudangSectionPage /></ProtectedRoute>
        </Route>
        <Route path="/helpdesk">
          <ProtectedRoute><HelpdeskPage /></ProtectedRoute>
        </Route>
        <Route path="/hr/appraisals">
          <ProtectedRoute><HRAppraisalsPage /></ProtectedRoute>
        </Route>
        <Route path="/hr/attendances">
          <ProtectedRoute><HRAttendancesPage /></ProtectedRoute>
        </Route>
        <Route path="/hr/bpjs">
          <ProtectedRoute><HRBPJSPage /></ProtectedRoute>
        </Route>
        <Route path="/hr/employees">
          <ProtectedRoute><HREmployeesPage /></ProtectedRoute>
        </Route>
        <Route path="/hr/fleet">
          <ProtectedRoute><HRFleetPage /></ProtectedRoute>
        </Route>
        <Route path="/hr/leaves">
          <ProtectedRoute><HRLeavesPage /></ProtectedRoute>
        </Route>
        <Route path="/hr/loans">
          <ProtectedRoute><HRLoansPage /></ProtectedRoute>
        </Route>
        <Route path="/hr/organization">
          <ProtectedRoute><HROrganizationPage /></ProtectedRoute>
        </Route>
        <Route path="/hr/payrolls/bank-export">
          <ProtectedRoute><HRPayrollsBankExportPage /></ProtectedRoute>
        </Route>
        <Route path="/hr/payrolls/batch">
          <ProtectedRoute><HRPayrollsBatchPage /></ProtectedRoute>
        </Route>
        <Route path="/hr/payrolls/bpjs-calc">
          <ProtectedRoute><HRPayrollsBpjsCalcPage /></ProtectedRoute>
        </Route>
        <Route path="/hr/payrolls/components">
          <ProtectedRoute><HRPayrollsComponentsPage /></ProtectedRoute>
        </Route>
        <Route path="/hr/payrolls/history">
          <ProtectedRoute><HRPayrollsHistoryPage /></ProtectedRoute>
        </Route>
        <Route path="/hr/payrolls">
          <ProtectedRoute><HRPayrollsPage /></ProtectedRoute>
        </Route>
        <Route path="/hr/payrolls/periods">
          <ProtectedRoute><HRPayrollsPeriodsPage /></ProtectedRoute>
        </Route>
        <Route path="/hr/payrolls/pph21-calc">
          <ProtectedRoute><HRPayrollsPph21CalcPage /></ProtectedRoute>
        </Route>
        <Route path="/hr/payrolls/reports">
          <ProtectedRoute><HRPayrollsReportsPage /></ProtectedRoute>
        </Route>
        <Route path="/hr/payrolls/settings">
          <ProtectedRoute><HRPayrollsSettingsPage /></ProtectedRoute>
        </Route>
        <Route path="/hr/payrolls/slips">
          <ProtectedRoute><HRPayrollsSlipsPage /></ProtectedRoute>
        </Route>
        <Route path="/hr/recruitment">
          <ProtectedRoute><HRRecruitmentPage /></ProtectedRoute>
        </Route>
        <Route path="/hr/settings">
          <ProtectedRoute><HRSettingsPage /></ProtectedRoute>
        </Route>
        <Route path="/hr/training">
          <ProtectedRoute><HRTrainingPage /></ProtectedRoute>
        </Route>
        <Route path="/integrations/kledo">
          <ProtectedRoute><IntegrationsKledoPage /></ProtectedRoute>
        </Route>
        <Route path="/inventory/deliveries">
          <ProtectedRoute><InventoryDeliveriesPage /></ProtectedRoute>
        </Route>
        <Route path="/inventory/landed-cost">
          <ProtectedRoute><InventoryLandedCostPage /></ProtectedRoute>
        </Route>
        <Route path="/inventory/lot-tracking">
          <ProtectedRoute><InventoryLotTrackingPage /></ProtectedRoute>
        </Route>
        <Route path="/inventory/lots">
          <ProtectedRoute><InventoryLotsPage /></ProtectedRoute>
        </Route>
        <Route path="/inventory/products/categories">
          <ProtectedRoute><InventoryProductsCategoriesPage /></ProtectedRoute>
        </Route>
        <Route path="/inventory/products">
          <ProtectedRoute><InventoryProductsPage /></ProtectedRoute>
        </Route>
        <Route path="/inventory/reorder-rules">
          <ProtectedRoute><InventoryReorderRulesPage /></ProtectedRoute>
        </Route>
        <Route path="/inventory/settings">
          <ProtectedRoute><InventorySettingsPage /></ProtectedRoute>
        </Route>
        <Route path="/inventory/stock-aging">
          <ProtectedRoute><InventoryStockAgingPage /></ProtectedRoute>
        </Route>
        <Route path="/inventory/stock-movements">
          <ProtectedRoute><InventoryStockMovementsPage /></ProtectedRoute>
        </Route>
        <Route path="/inventory/stock-opnames">
          <ProtectedRoute><InventoryStockOpnamesPage /></ProtectedRoute>
        </Route>
        <Route path="/inventory/stock-valuation">
          <ProtectedRoute><InventoryStockValuationPage /></ProtectedRoute>
        </Route>
        <Route path="/inventory/transfers">
          <ProtectedRoute><InventoryTransfersPage /></ProtectedRoute>
        </Route>
        <Route path="/inventory/warehouses">
          <ProtectedRoute><InventoryWarehousesPage /></ProtectedRoute>
        </Route>
        <Route path="/invoice/aging">
          <ProtectedRoute><InvoiceAgingPage /></ProtectedRoute>
        </Route>
        <Route path="/invoice/credit-notes">
          <ProtectedRoute><InvoiceCreditNotesPage /></ProtectedRoute>
        </Route>
        <Route path="/invoice/down-payment">
          <ProtectedRoute><InvoiceDownPaymentPage /></ProtectedRoute>
        </Route>
        <Route path="/invoice/list">
          <ProtectedRoute><InvoiceListPage /></ProtectedRoute>
        </Route>
        <Route path="/monitoring/driver">
          <ProtectedRoute><MonitoringDriverPage /></ProtectedRoute>
        </Route>
        <Route path="/monitoring/gudang">
          <ProtectedRoute><MonitoringGudangPage /></ProtectedRoute>
        </Route>
        <Route path="/monitoring/pos">
          <ProtectedRoute><MonitoringPosPage /></ProtectedRoute>
        </Route>
        <Route path="/monitoring/sales">
          <ProtectedRoute><MonitoringSalesPage /></ProtectedRoute>
        </Route>
        <Route path="/pos/cashier">
          <ProtectedRoute><POSCashierPage /></ProtectedRoute>
        </Route>
        <Route path="/pos/orders">
          <ProtectedRoute><POSOrdersPage /></ProtectedRoute>
        </Route>
        <Route path="/pos/products">
          <ProtectedRoute><POSProductsPage /></ProtectedRoute>
        </Route>
        <Route path="/pos/reports">
          <ProtectedRoute><POSReportsPage /></ProtectedRoute>
        </Route>
        <Route path="/pos/sessions">
          <ProtectedRoute><POSSessionsPage /></ProtectedRoute>
        </Route>
        <Route path="/pos/settings">
          <ProtectedRoute><POSSettingsPage /></ProtectedRoute>
        </Route>
        <Route path="/purchasing/purchase-orders/new">
          <ProtectedRoute><PurchasingNewOrderPage /></ProtectedRoute>
        </Route>
        <Route path="/service/estimates">
          <ProtectedRoute><ServiceEstimatesPage /></ProtectedRoute>
        </Route>
        <Route path="/service/work-orders">
          <ProtectedRoute><ServiceWorkOrdersPage /></ProtectedRoute>
        </Route>
        <Route path="/settings/activity-log">
          <ProtectedRoute><SettingsActivityLogPage /></ProtectedRoute>
        </Route>
        <Route path="/settings/api-integration">
          <ProtectedRoute><SettingsApiIntegrationPage /></ProtectedRoute>
        </Route>
        <Route path="/settings/audit-log">
          <ProtectedRoute><SettingsAuditLogPage /></ProtectedRoute>
        </Route>
        <Route path="/settings/backup">
          <ProtectedRoute><SettingsBackupPage /></ProtectedRoute>
        </Route>
        <Route path="/settings/document-numbers">
          <ProtectedRoute><SettingsDocumentNumbersPage /></ProtectedRoute>
        </Route>
        <Route path="/settings/email-gateway">
          <ProtectedRoute><SettingsEmailGatewayPage /></ProtectedRoute>
        </Route>
        <Route path="/settings/wa-gateway">
          <ProtectedRoute><SettingsWaGatewayPage /></ProtectedRoute>
        </Route>
        <Route path="/tax/efaktur">
          <ProtectedRoute><TaxEfakturPage /></ProtectedRoute>
        </Route>
        <Route path="/tax/rekap-ppn">
          <ProtectedRoute><TaxRekapPpnPage /></ProtectedRoute>
        </Route>
        <Route path="/tax/setup">
          <ProtectedRoute><TaxSetupPage /></ProtectedRoute>
        </Route>
        <Route>
          <ProtectedRoute><PlaceholderPage title="Halaman tidak ditemukan" /></ProtectedRoute>
        </Route>
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
