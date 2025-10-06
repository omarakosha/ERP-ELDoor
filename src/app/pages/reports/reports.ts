import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesReportComponent } from '../../reports/sales-report/sales-report';
import { PurchasesReportComponent } from '../../reports/purchases-report/purchases-report';
import { InventoryReportComponent } from '../../reports/inventory-report/inventory-report';
import { TaxesReportComponent } from '../../reports/taxes-report/taxes-report';
import { ReportCardComponent } from '@/reports/report-card.component/report-card.component';
import { PurchasesReportsService } from '../service/purchases.reports.service';
import { SalesReportsService } from '../service/sales.reports.service';
import { InventoryReportsService } from '../service/Inventory.reports.service';
import { TaxesReportsService } from '../service/taxes.reports.service';

interface Report {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  lastUpdate: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    ReportCardComponent,
    SalesReportComponent,
    PurchasesReportComponent,
    InventoryReportComponent,
    TaxesReportComponent,
  ],
  templateUrl: './reports.html',
})
export class ReportsComponent implements OnInit {
  activeTab: 'favorites' | 'sales' | 'purchases' | 'inventory' | 'taxes' = 'favorites';
  favoriteReports: string[] = [];
  allReports: Report[] = [];

  constructor(
    private inventoryReportsService: InventoryReportsService,
    private purchasesReportsService: PurchasesReportsService,
    private salesReportsService: SalesReportsService,
    private taxesReportsService: TaxesReportsService
  ) { }

  ngOnInit() {
    // جلب كل التقارير من الخدمة
    this.allReports = [
    ...this.inventoryReportsService.getData(),
    ...this.purchasesReportsService.getData(),
    ...this.salesReportsService.getData(),
    ...this.taxesReportsService.getData()
  ];

    // جلب المفضلات من localStorage
    const stored = localStorage.getItem('favoriteReports');
    if (stored) this.favoriteReports = JSON.parse(stored);
  }

  // دالة للحصول على التقرير كاملًا حسب id
  getReportById(reportId: string): Report {
    return this.allReports.find(r => r.id === reportId) || {
      id: reportId,
      title: 'تقرير غير موجود',
      description: 'لا يوجد وصف متاح لهذا التقرير',
      icon: 'pi pi-star',
      iconColor: 'text-yellow-500',
      lastUpdate: ''
    };
  }

  // تعديل المفضلة عند الضغط على أي كارد
  toggleFavoriteFromChild(reportId: string) {
    const index = this.favoriteReports.indexOf(reportId);
    if (index > -1) this.favoriteReports.splice(index, 1);
    else this.favoriteReports.push(reportId);

    localStorage.setItem('favoriteReports', JSON.stringify(this.favoriteReports));
  }
}
