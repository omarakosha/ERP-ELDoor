import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportCardComponent } from '../report-card.component/report-card.component';

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

   reports: Report[] = [
    {
      id: 'tax-declaration',
      title: 'الإقرار الضريبي',
      description:
        'ملخص شامل لكل ما يتعلق بالضرائب في النظام، بحيث يساعدك على البقاء متوافقًا مع متطلبات هيئة الزكاة والدخل.',
      icon: 'pi pi-file-text',
      iconColor: 'text-red-500',
      lastUpdate: '06/10/2025',
    },
    {
      id: 'vat-summary',
      title: 'ملخص ضريبة القيمة المضافة',
      description: 'عرض تفصيلي لمبالغ الضريبة المحصلة والمدفوعة لتسهيل إعداد الإقرار الضريبي.',
      icon: 'pi pi-percentage',
      iconColor: 'text-green-500',
      lastUpdate: '06/10/2025',
    },
    {
      id: 'tax-adjustments',
      title: 'تسويات الضرائب',
      description: 'تحليل شامل للتسويات الضريبية الناتجة عن فروقات الفواتير أو التصحيحات المحاسبية.',
      icon: 'pi pi-refresh',
      iconColor: 'text-blue-500',
      lastUpdate: '06/10/2025',
    },
  ];

  toggleFavorite(reportId: string) {
    this.favoriteChanged.emit(reportId);
  }

  isFavorite(reportId: string): boolean {
    return this.favoriteReports.includes(reportId);
  }
}
