import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportCardComponent } from '../reportscomponents/report-card.component/report-card.component';
import { SalesReportsService } from '@/pages/service/sales.reports.service';
import { ReportTableComponent } from '../reportscomponents/report-table.component/report-table.component';

interface Report {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  lastUpdate: string;
}

@Component({
  selector: 'app-sales-report',
  standalone: true,
  imports: [CommonModule, ReportCardComponent,ReportTableComponent

  ],
  templateUrl: './sales-report.html',
})
export class SalesReportComponent {
  @Input() favoriteReports: string[] = [];
  @Output() favoriteChanged = new EventEmitter<string>();
  @ViewChild('statusFilter') statusFilter!: TemplateRef<any>;
  @ViewChild('representativeFilter') representativeFilter!: TemplateRef<any>;
  @ViewChild('activityFilter') activityFilter!: TemplateRef<any>;
  @ViewChild('statusTemplate') statusTemplate!: TemplateRef<any>;
  @ViewChild('activityTemplate') activityTemplate!: TemplateRef<any>;


    taxColumns: any[] = [];
  selectedReportId: string | null = null;


    taxData: any[] = [
    { invoiceNo: 'INV001', supplier: 'ABC', amount: 1500, date: '2025-10-05', status: 'paid', activity: 70 },
    { invoiceNo: 'INV002', supplier: 'XYZ', amount: 2400, date: '2025-10-06', status: 'pending', activity: 50 },
  ];


   reports: Report[] =[];


  constructor(private salesReportsService: SalesReportsService) { }
  ngOnInit() {
    // ✅ جلب البيانات من الخدمة
    this.reports = this.salesReportsService.getData();
  }
  toggleFavorite(reportId: string) {
    this.favoriteChanged.emit(reportId);
  }

  isFavorite(reportId: string): boolean {
    return this.favoriteReports.includes(reportId);
  }





    onEdit(row: any) { console.log('Edit', row); }
  onDelete(row: any) { console.log('Delete', row); }
  onPrint(row: any) { console.log('Print', row); }



      loadReportData(reportId: string) {
    if (reportId === 'customer-payments') {
      this.taxData = [
        { invoiceNo: 'INV-1001', supplier: 'مؤسسة النور', amount: 5000, date: '2025-10-05', status: 'paid', activity: 80 },
        { invoiceNo: 'INV-1002', supplier: 'شركة السريع', amount: 3200, date: '2025-10-06', status: 'pending', activity: 40 },
      ];
    } else if (reportId === 'sales-per-location') {
      this.taxData = [
        { invoiceNo: 'INV-2001', supplier: 'شركة ABC', amount: 1200, date: '2025-10-01', status: 'paid', activity: 60 },
        { invoiceNo: 'INV-2002', supplier: 'شركة XYZ', amount: 980, date: '2025-10-03', status: 'unpaid', activity: 30 },
      ];
    } else {
      this.taxData = [];
    }
  }

  onReportSelected(reportId: string) {
  this.selectedReportId = reportId;
  this.loadReportData(reportId);
}

getReportTitle(reportId: string): string {
  const report = this.reports.find(r => r.id === reportId);
  return report ? report.title : '';
}


    ngAfterViewInit() {
    this.taxColumns = [
      { field: 'invoiceNo', header: 'رقم الفاتورة' },
      { field: 'supplier', header: 'المورد' },
      { field: 'amount', header: 'المبلغ' },
      { field: 'date', header: 'التاريخ' },
      { field: 'status', header: 'الحالة', filter: this.statusFilter, template: this.statusTemplate },
      { field: 'representative.name', header: 'المندوب', filter: this.representativeFilter },
      { field: 'activity', header: 'النشاط', filter: this.activityFilter, template: this.activityTemplate },
    ];
  }

}
