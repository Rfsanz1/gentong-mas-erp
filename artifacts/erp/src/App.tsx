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
