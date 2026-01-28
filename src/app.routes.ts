// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { CasherposComponent } from '@/pages/casherpos/casherpos.component';
import { PosComponent } from './app/pages/pos/pos';
import { PosManagementComponent } from './app/pages/pos-management/pos-management-component';
import { SalesInvoicesComponent } from './app/pages/sales-invoices/sales-invoices';
import { Orders } from './app/pages/orders/orders';
import { CRMComponent } from './app/pages/CRM/crm';
import { PaymentsComponent } from './app/pages/payments/payments-component';
import { Crud } from './app/pages/crud/crud';
import { InventoryComponent } from './app/pages/inventory/inventory';
import { StockTransferComponent } from './app/pages/stock-transfer/stock-transfer.component';
import { PurchaseOrdersComponent } from './app/pages/Purchase-Invoices/Purchase-Invoices';
import { PurchaseReturnsComponent } from './app/pages/purchase-returns/purchase-returns.component';
import { SuppliersComponent } from './app/pages/suppliers/suppliers.component';
import { SupplierPaymentsComponent } from './app/pages/supplier-payments/supplier-payments.component';
import { AccountsManager } from './app/pages/accounts-manager/accounts-manager';
import { JournalEntriesComponent } from './app/pages/journal-entries/journal-entries';
import { TrialBalanceComponent } from './app/pages/trial-balance/trial-balance';
import { ProfitLossComponent } from './app/pages/profit-loss/profit-loss';
import { BalanceSheetComponent } from './app/pages/balancesheet/balancesheet';
import { EntityComponent } from './app/pages/entity/entity.component';
import { ReportsComponent } from './app/pages/reports/reports';
import { FinancialReportComponent } from './app/pages/financial-report/financial-report.component';

export const appRoutes: Routes = [
  {
    path: '',
    component: AppLayout,
    data: { breadcrumb: 'MENU.HOME' },
    children: [
      { path: '', component: Dashboard, data: { breadcrumb: 'MENU.DASHBOARD' } },
      { path: 'documentation', component: Documentation, data: { breadcrumb: 'MENU.DOCUMENTATION' } },
      { path: 'casher', component: CasherposComponent, data: { breadcrumb: 'MENU.CASHIER_POS' } },

      // ================= Sales & Customers =================
      { path: 'pages/pos', component: PosComponent, data: { breadcrumb: 'MENU.POS' } },
      { path: 'pages/pos-management', component: PosManagementComponent, data: { breadcrumb: 'MENU.CASH_REGISTERS' } },
      { path: 'pages/sales-invoices', component: SalesInvoicesComponent, data: { breadcrumb: 'MENU.SALES_INVOICES' } },
      { path: 'pages/orders', component: Orders, data: { breadcrumb: 'MENU.STORE_ORDERS' } },
      { path: 'pages/CRM', component: CRMComponent, data: { breadcrumb: 'MENU.CUSTOMERS' } },
      { path: 'pages/payments', component: PaymentsComponent, data: { breadcrumb: 'MENU.CUSTOMER_PAYMENTS' } },

      // ================= Products & Inventory =================
      { path: 'pages/crud', component: Crud, data: { breadcrumb: 'MENU.PRODUCTS' } },
      { path: 'pages/inventory', component: InventoryComponent, data: { breadcrumb: 'MENU.INVENTORY_STOCK' } },
      { path: 'pages/stock-transfer', component: StockTransferComponent, data: { breadcrumb: 'MENU.STOCK_TRANSFER' } },

      // ================= Purchases & Suppliers =================
      { path: 'pages/purchase-invoices', component: PurchaseOrdersComponent, data: { breadcrumb: 'MENU.PURCHASE_INVOICES' } },
      { path: 'pages/purchase-returns', component: PurchaseReturnsComponent, data: { breadcrumb: 'MENU.PURCHASE_RETURNS' } },
      { path: 'pages/suppliers', component: SuppliersComponent, data: { breadcrumb: 'MENU.SUPPLIERS' } },
      { path: 'pages/supplier-payments', component: SupplierPaymentsComponent, data: { breadcrumb: 'MENU.SUPPLIER_PAYMENTS' } },

      // ================= Accounting =================
      { path: 'pages/accounts-manager', component: AccountsManager, data: { breadcrumb: 'MENU.TREE_ACCOUNTS' } },
      { path: 'pages/journal-entries', component: JournalEntriesComponent, data: { breadcrumb: 'MENU.JOURNAL_ENTRIES' } },
      { path: 'pages/trial-balance', component: TrialBalanceComponent, data: { breadcrumb: 'MENU.TRIAL_BALANCE' } },
      { path: 'pages/profit-loss', component: ProfitLossComponent, data: { breadcrumb: 'MENU.PROFIT_LOSS' } },
      { path: 'pages/balancesheet', component: BalanceSheetComponent, data: { breadcrumb: 'MENU.BALANCE_SHEET' } },
      { path: 'pages/entity', component: EntityComponent, data: { breadcrumb: 'MENU.ENTITY_MANAGER' } },

      // ================= Reports =================
      { path: 'pages/reports', component: ReportsComponent, data: { breadcrumb: 'MENU.ALL_REPORTS' } },
      { path: 'pages/financial-report', component: FinancialReportComponent, data: { breadcrumb: 'MENU.FINANCIAL_REPORTS' } }
    ]
  },

  { path: 'landing', component: Landing, data: { breadcrumb: 'MENU.LANDING' } },
  { path: 'notfound', component: Notfound, data: { breadcrumb: 'MENU.NOT_FOUND' } },
  { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes'), data: { breadcrumb: 'MENU.AUTH' } },
  { path: '**', redirectTo: '/notfound' }
];
