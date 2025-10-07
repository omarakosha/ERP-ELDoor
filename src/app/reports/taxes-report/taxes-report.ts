import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportCardComponent } from '../reportscomponents/report-card.component/report-card.component';
import { TaxesReportsService } from '@/pages/service/taxes.reports.service';

interface Report {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  lastUpdate: string;
}

@Component({
  selector: 'app-taxes-report',
  standalone: true,
  imports: [CommonModule, ReportCardComponent],
  templateUrl: './taxes-report.html',
})
export class TaxesReportComponent {
  @Input() favoriteReports: string[] = [];
  @Output() favoriteChanged = new EventEmitter<string>();

   reports: Report[] =[];
     constructor(private taxesReportsService: TaxesReportsService) {}
   
     ngOnInit() {
       // ✅ جلب البيانات من الخدمة
       this.reports = this.taxesReportsService.getData();
     }

  toggleFavorite(reportId: string) {
    this.favoriteChanged.emit(reportId);
  }

  isFavorite(reportId: string): boolean {
    return this.favoriteReports.includes(reportId);
  }
}
