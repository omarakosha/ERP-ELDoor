import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportCardComponent } from '../reportscomponents/report-card.component/report-card.component';
import { SalesReportsService } from '@/pages/service/sales.reports.service';


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
  imports: [CommonModule, ReportCardComponent],
  templateUrl: './sales-report.html',
})
export class SalesReportComponent {
  @Input() favoriteReports: string[] = [];
  @Output() favoriteChanged = new EventEmitter<string>();

  reports: Report[] = [];
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
}
