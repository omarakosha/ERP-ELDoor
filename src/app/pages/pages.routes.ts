import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { Orders } from './orders/orders';
import { CRMComponent } from './CRM/crm';
import { InventoryComponent } from './inventory/inventory';
import { SalesInvoicesComponent } from './sales-invoices/sales-invoices';
import { PurchaseOrdersComponent } from './Purchase-Invoices/Purchase-Invoices';
import { JournalEntriesComponent } from './journal-entries/journal-entries';
import { TrialBalanceComponent } from './trial-balance/trial-balance';
import { ProfitLossComponent } from './profit-loss/profit-loss';
import { AccountsManager } from './accounts-manager/accounts-manager';
import { ReportsComponent } from './reports/reports';
import { FinancialReportComponent } from './financial-report/financial-report.component';
import { PosComponent } from './pos/pos';
import { PosManagementComponent } from './pos-management/pos-management-component';
import { PaymentsComponent } from './payments/payments-component';
import { StockTransferComponent } from './stock-transfer/stock-transfer.component';
import { PurchaseReturnsComponent } from './purchase-returns/purchase-returns.component';
import { SuppliersComponent } from './suppliers/suppliers.component';
import { SupplierPaymentsComponent } from './supplier-payments/supplier-payments.component';
import { BalanceSheetComponent } from './balancesheet/balancesheet';
import { EntityComponent } from './entity/entity.component';

export default [
  { path: 'documentation', component: Documentation, data: { breadcrumb: 'MENU.DOCUMENTATION' } },
  { path: 'crud', component: Crud, data: { breadcrumb: 'MENU.PRODUCTS' } },
  { path: 'orders', component: Orders, data: { breadcrumb: 'MENU.ORDERS' } },
  { path: 'CRM', component: CRMComponent, data: { breadcrumb: 'MENU.CUSTOMERS' } },
  { path: 'inventory', component: InventoryComponent, data: { breadcrumb: 'MENU.INVENTORY' } },

  { path: 'sales-invoices', component: SalesInvoicesComponent, data: { breadcrumb: 'MENU.SALES_INVOICES' } },
  { path: 'purchase-invoices', component: PurchaseOrdersComponent, data: { breadcrumb: 'MENU.PURCHASE_INVOICES' } },

  { path: 'journal-entries', component: JournalEntriesComponent, data: { breadcrumb: 'MENU.JOURNAL_ENTRIES' } },
  { path: 'trial-balance', component: TrialBalanceComponent, data: { breadcrumb: 'MENU.TRIAL_BALANCE' } },
  { path: 'balancesheet', component: BalanceSheetComponent, data: { breadcrumb: 'MENU.BALANCE_SHEET' } },
  { path: 'profit-loss', component: ProfitLossComponent, data: { breadcrumb: 'MENU.PROFIT_LOSS' } },

  { path: 'accounts-manager', component: AccountsManager, data: { breadcrumb: 'MENU.TREE_ACCOUNTS' } },
  { path: 'entity', component: EntityComponent, data: { breadcrumb: 'MENU.ENTITY_MANAGER' } },

  { path: 'financial-report', component: FinancialReportComponent, data: { breadcrumb: 'MENU.FINANCIAL_REPORTS' } },
  { path: 'reports', component: ReportsComponent, data: { breadcrumb: 'MENU.REPORTS' } },

  { path: 'pos', component: PosComponent, data: { breadcrumb: 'MENU.POS' } },
  { path: 'pos-management', component: PosManagementComponent, data: { breadcrumb: 'MENU.CASH_REGISTERS' } },

  { path: 'payments', component: PaymentsComponent, data: { breadcrumb: 'MENU.PAYMENTS' } },
  { path: 'stock-transfer', component: StockTransferComponent, data: { breadcrumb: 'MENU.STOCK_TRANSFER' } },
  { path: 'purchase-returns', component: PurchaseReturnsComponent, data: { breadcrumb: 'MENU.PURCHASE_RETURNS' } },

  { path: 'suppliers', component: SuppliersComponent, data: { breadcrumb: 'MENU.SUPPLIERS' } },
  { path: 'supplier-payments', component: SupplierPaymentsComponent, data: { breadcrumb: 'MENU.SUPPLIER_PAYMENTS' } },

  { path: 'empty', component: Empty, data: { breadcrumb: 'MENU.EMPTY' } },

  { path: '**', redirectTo: '/notfound' }
] as Routes;
