import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesReportComponent } from '../../reports/sales-report/sales-report';
import { PurchasesReportComponent } from '../../reports/purchases-report/purchases-report';
import { InventoryReportComponent } from '../../reports/inventory-report/inventory-report';
import { TaxesReportComponent } from '../../reports/taxes-report/taxes-report';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    SalesReportComponent,
    PurchasesReportComponent,
    InventoryReportComponent,
    TaxesReportComponent,
  ],
  templateUrl: './reports.html',
})
export class ReportsComponent {
  activeTab: 'favorites' | 'sales' | 'purchases' | 'inventory' | 'taxes' =
    'favorites';

  favoriteReports: string[] = [];

  toggleFavoriteFromChild(reportId: string) {
    const index = this.favoriteReports.indexOf(reportId);
    if (index > -1) {
      this.favoriteReports.splice(index, 1);
    } else {
      this.favoriteReports.push(reportId);
    }
  }
}
