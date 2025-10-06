import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportCardComponent } from '../report-card.component/report-card.component';

import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { PurchasesReportsService, Report } from '@/pages/service/purchases.reports.service';


@Component({
  selector: 'app-purchases-report',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ReportCardComponent],
  templateUrl: './purchases-report.html',
})
export class PurchasesReportComponent implements OnInit {
  @Input() favoriteReports: string[] = [];
  @Output() favoriteChanged = new EventEmitter<string>();
  selectedReport: Report | null = null;

  reports: Report[] = [];
  selectedReportId: string | null = null;  // التقرير الحالي
  tableData: any[] = [];                   // بيانات الجدول
  filterText: string = '';                 // نص البحث

  constructor(private purchasesReportsService: PurchasesReportsService) {}

  ngOnInit() {
    // ✅ جلب البيانات من الخدمة
    this.reports = this.purchasesReportsService.getData();
  }

  toggleFavorite(reportId: string) {
    this.favoriteChanged.emit(reportId);
  }

  isFavorite(reportId: string): boolean {
    return this.favoriteReports.includes(reportId);
  }

onReportSelected(reportId: string) {
  this.selectedReportId = reportId;
  this.selectedReport = this.reports.find(r => r.id === reportId) || null;
  this.loadReportData(reportId);
}
  loadReportData(reportId: string) {
    // مؤقتًا بيانات وهمية، يمكن استبدالها بجلب بيانات من API لاحقًا
    if (reportId === 'supplier-transactions') {
      this.tableData = [
        { supplier: 'مؤسسة النور', amount: 5000, date: '2025-10-05' },
        { supplier: 'شركة السريع', amount: 3200, date: '2025-10-06' },
      ];
    } else if (reportId === 'purchase-summary') {
      this.tableData = [
        { invoice: 'INV-1001', total: 1200, date: '2025-10-01' },
        { invoice: 'INV-1002', total: 980, date: '2025-10-03' },
      ];
    } else {
      this.tableData = [];
    }
  }
  
}
