import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportCardComponent } from '../report-card.component/report-card.component';
import { InventoryReportsService } from '@/pages/service/Inventory.reports.service';// ✅ لاحظ الاسم الصغير

interface Report {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  lastUpdate: string;
}

@Component({
  selector: 'app-inventory-report',
  standalone: true,
  imports: [CommonModule, ReportCardComponent],
  templateUrl: './inventory-report.html',
})
export class InventoryReportComponent implements OnInit {
  @Input() favoriteReports: string[] = [];
  @Output() favoriteChanged = new EventEmitter<string>();

  reports: Report[] = [];

  constructor(private inventoryReportsService: InventoryReportsService) {}

  ngOnInit() {
    // ✅ جلب البيانات من الخدمة
    this.reports = this.inventoryReportsService.getData();
  }

  toggleFavorite(reportId: string) {
    this.favoriteChanged.emit(reportId);
  }

  isFavorite(reportId: string): boolean {
    return this.favoriteReports.includes(reportId);
  }
}
