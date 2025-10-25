import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesReportComponent } from '../../reports/sales-report/sales-report';
import { PurchasesReportComponent } from '../../reports/purchases-report/purchases-report';
import { InventoryReportComponent } from '../../reports/inventory-report/inventory-report';
import { TaxesReportComponent } from '../../reports/taxes-report/taxes-report';
import { ReportCardComponent } from '@/reports/reportscomponents/report-card.component/report-card.component';
import { ReportTableComponent } from '@/reports/reportscomponents/report-table.component/report-table.component';
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
    ReportTableComponent,
    
  ],
  templateUrl: './reports.html',
})
export class ReportsComponent implements OnInit {
  activeTab = 'favorites' as 'favorites' | 'sales' | 'purchases' | 'inventory' | 'taxes';
  selectedReportId: string | null = null;
  favoriteReports: string[] = [];
  allReports: Report[] = [];
   private searchTimeout: any;

  constructor(
    private inventoryReportsService: InventoryReportsService,
    private purchasesReportsService: PurchasesReportsService,
    private salesReportsService: SalesReportsService,
    private taxesReportsService: TaxesReportsService
  ) { }

  ngOnInit() {
    // جلب كل التقارير من الخدمات
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

  // إرجاع تقرير حسب ID
  getReportById(reportId: string): Report {
    if (!reportId) {
      return { id: '', title: '', description: '', icon: '', iconColor: '', lastUpdate: '' };
    }
    return this.allReports.find(r => r.id === reportId) || {
      id: reportId,
      title: 'تقرير غير موجود',
      description: 'لا يوجد وصف متاح لهذا التقرير',
      icon: 'pi pi-star',
      iconColor: 'text-yellow-500',
      lastUpdate: ''
    };
  }

  // ======================
  // خصائص الجدول
  // ======================
  get columns(): any[] {
    switch (this.selectedReportId) {
      case 'customer-payments':
        return [
          { field: 'supplier', header: 'كود المنتج' },
          { field: 'vatcstm', header: 'اسم المنتج' },
          { field: 'vatamount', header: 'الفئة' },
          { field: 'mountpay', header: 'الكمية' },
        ];
      case 'low-stock':
        return [
          { field: 'productCode', header: 'كود المنتج' },
          { field: 'productName', header: 'اسم المنتج' },
          { field: 'quantity', header: 'الكمية الحالية' },
          { field: 'reorderLevel', header: 'حد إعادة الطلب' },
        ];
      default:
        // أعمدة افتراضية لأي تقرير آخر
        return [
          { field: 'id', header: 'ID' },
          { field: 'title', header: 'اسم التقرير' },
          { field: 'description', header: 'الوصف' },
        ];
    }
  }

get reportData(): any[] {
  switch (this.selectedReportId) {
    case 'customer-payments':
      return [
          { supplier: 'مؤسسة النور', vatcstm: '100252525458200125', vatamount: 5000, mountpay: 52220, mountdsc: 20000 },
        { supplier: 'شركة السريع', vatcstm: '100252525458212224', vatamount: 3200, mountpay: 522222, mountdsc: 2555555 },
      ];
    case 'low-stock':
      return [
        { productCode: 'P005', productName: 'مكتب صغير', quantity: 3, reorderLevel: 10 },
      ];
    default:
      return []; // <--- هنا المشكلة، أي تقرير آخر يعطي جدول فارغ
  }
}

  // ======================
  // أحداث الجدول
  // ======================
  onEdit(row: any) { console.log('Edit', row); }
  onDelete(row: any) { console.log('Delete', row); }
  onPrint(row: any) { console.log('Print', row); }

  // ======================
  // إدارة المفضلة
  // ======================
  toggleFavoriteFromChild(reportId: string) {
    const index = this.favoriteReports.indexOf(reportId);
    if (index > -1) this.favoriteReports.splice(index, 1);
    else this.favoriteReports.push(reportId);

    localStorage.setItem('favoriteReports', JSON.stringify(this.favoriteReports));
  }

  selectReport(reportId: string) {
    this.selectedReportId = reportId;
  }

  setActiveTab(tab: 'favorites' | 'sales' | 'purchases' | 'inventory' | 'taxes') {
  if (this.activeTab === tab) {
    this.selectedReportId = null; // إخفاء الجدول وإرجاع القائمة
  }
  this.activeTab = tab;
}

   onGlobalFilter(table: any, event: Event) {
    const input = event.target as HTMLInputElement;
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      table.filterGlobal(input.value, 'contains');
    }, 300);
  }
}
