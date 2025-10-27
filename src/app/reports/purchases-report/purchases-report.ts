import { Component, EventEmitter, Input, Output, OnInit, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MultiSelectModule } from 'primeng/multiselect';
import { SliderModule } from 'primeng/slider';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { PurchasesReportsService, Report } from '@/pages/service/purchases.reports.service';
import { ReportCardComponent } from '../reportscomponents/report-card.component/report-card.component';
import { ReportTableComponent } from '../reportscomponents/report-table.component/report-table.component';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-purchases-report',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ReportCardComponent, ReportTableComponent,
    ProgressBarModule, TagModule, SliderModule, SelectButtonModule, MultiSelectModule,ButtonModule
  ],
  templateUrl: './purchases-report.html',
})
export class PurchasesReportComponent implements OnInit, AfterViewInit {
  @Input() favoriteReports: string[] = [];
  @Output() favoriteChanged = new EventEmitter<string>();

  selectedReport: Report | null = null;
  reports: Report[] = [];
  selectedReportId: string | null = null;

  activityValues: number[] = [0, 100];

  @ViewChild('statusFilter') statusFilter!: TemplateRef<any>;
  @ViewChild('representativeFilter') representativeFilter!: TemplateRef<any>;
  @ViewChild('activityFilter') activityFilter!: TemplateRef<any>;
  @ViewChild('statusTemplate') statusTemplate!: TemplateRef<any>;
  @ViewChild('activityTemplate') activityTemplate!: TemplateRef<any>;

  // بيانات الجدول
  purchaseData: any[] = [
    { invoiceNo: 'INV001', supplier: 'ABC', amount: 1500, date: '2025-10-05', status: 'paid', activity: 70 },
    { invoiceNo: 'INV002', supplier: 'XYZ', amount: 2400, date: '2025-10-06', status: 'pending', activity: 50 },
  ];

  // الفلاتر العامة
  statuses = [
    { label: 'مدفوع', value: 'paid' },
    { label: 'غير مدفوع', value: 'unpaid' },
    { label: 'قيد الانتظار', value: 'pending' },
  ];

  representatives = [
    { name: 'John', image: '1.png' },
    { name: 'Anna', image: '2.png' },
  ];

  purchaseColumns: any[] = [];

  constructor(private purchasesReportsService: PurchasesReportsService) {}

  ngOnInit() {
    this.reports = this.purchasesReportsService.getData();
  }

  ngAfterViewInit() {
    this.purchaseColumns = [
      { field: 'invoiceNo', header: 'رقم الفاتورة' },
      { field: 'supplier', header: 'المورد' },
      { field: 'amount', header: 'المبلغ' },
      { field: 'date', header: 'التاريخ' },
      { field: 'status', header: 'الحالة', filter: this.statusFilter, template: this.statusTemplate },
      { field: 'representative.name', header: 'المندوب', filter: this.representativeFilter },
      { field: 'activity', header: 'النشاط', filter: this.activityFilter, template: this.activityTemplate },
    ];
  }

  toggleFavorite(reportId: string) { this.favoriteChanged.emit(reportId); }
  isFavorite(reportId: string) { return this.favoriteReports.includes(reportId); }

  onReportSelected(reportId: string) {
    this.selectedReportId = reportId;
    this.selectedReport = this.reports.find(r => r.id === reportId) || null;
    this.loadReportData(reportId);
  }

  loadReportData(reportId: string) {
    if (reportId === 'supplier-transactions') {
      this.purchaseData = [
        { invoiceNo: 'INV-1001', supplier: 'مؤسسة النور', amount: 5000, date: '2025-10-05', status: 'paid', activity: 80 },
        { invoiceNo: 'INV-1002', supplier: 'شركة السريع', amount: 3200, date: '2025-10-06', status: 'pending', activity: 40 },
      ];
    } else if (reportId === 'purchase-summary') {
      this.purchaseData = [
        { invoiceNo: 'INV-2001', supplier: 'شركة ABC', amount: 1200, date: '2025-10-01', status: 'paid', activity: 60 },
        { invoiceNo: 'INV-2002', supplier: 'شركة XYZ', amount: 980, date: '2025-10-03', status: 'unpaid', activity: 30 },
      ];
    } else {
      this.purchaseData = [];
    }
  }

  onEdit(row: any) { console.log('Edit', row); }
  onDelete(row: any) { console.log('Delete', row); }
  onPrint(row: any) { console.log('Print', row); }

  getSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | null {
    switch (status) {
      case 'active': case 'paid': case 'مدفوع': return 'success';
      case 'pending': case 'قيد الانتظار': return 'warn';
      case 'unpaid': case 'غير مدفوع': case 'inactive': return 'danger';
      default: return null;
    }
  }

  // تعديل Slider لتفادي أخطاء الـ type
  onSliderEnd(event: any, filterCallback: (value: number[]) => void) {
    filterCallback(event.value || event.values || this.activityValues);
  }
  onStatusChange(event: any, filterCallback: (value: any) => void) {
  filterCallback(event.value);
}

onRepresentativeChange(event: any, filterCallback: (value: any) => void) {
  filterCallback(event.value);
}
getReportTitle(reportId: string): string {
  const report = this.reports.find(r => r.id === reportId);
  return report ? report.title : '';
}

}
