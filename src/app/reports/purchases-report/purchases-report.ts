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
  selector: 'app-purchases-report',
  standalone: true,
  imports: [CommonModule, ReportCardComponent],
  templateUrl: './purchases-report.html',
})
export class PurchasesReportComponent {
  @Input() favoriteReports: string[] = [];
  @Output() favoriteChanged = new EventEmitter<string>();


  reports: Report[] = [
    {
      id: 'supplier-transactions',
      title: 'تقرير معاملات الموردين',
      description: 'تتبع العمليات التي قام بها الموردين في متجرك',
      icon: 'pi pi-exchange',
      iconColor: 'text-orange-500',
      lastUpdate: '06/10/2025',
    },
    {
      id: 'purchase-summary',
      title: 'ملخص فواتير المشتريات',
      description: 'ملخص لعمليات المشتريات التي قمت بها، لتساعدك في إدارة عمليات الشراء المستقبلية',
      icon: 'pi pi-file',
      iconColor: 'text-blue-500',
      lastUpdate: '06/10/2025',
    },
    {
      id: 'supplier-debts',
      title: 'مستحقات من الموردين',
      description: 'كشف حساب مدين شامل لكل الموردين مع العمليات والمبالغ المستحقة',
      icon: 'pi pi-credit-card',
      iconColor: 'text-red-500',
      lastUpdate: '06/10/2025',
    },
    {
      id: 'supplier-credits',
      title: 'مستحقات للموردين',
      description: 'كشف حساب دائن شامل لكل الموردين مع العمليات والمبالغ المستحقة',
      icon: 'pi pi-credit-card',
      iconColor: 'text-green-500',
      lastUpdate: '06/10/2025',
    },
    {
      id: 'purchase-invoice-details',
      title: 'تفاصيل فاتورة الشراء',
      description: 'تقرير تفصيلي عن فواتير المشتريات مع جميع التفاصيل المهمة',
      icon: 'pi pi-file-edit',
      iconColor: 'text-purple-500',
      lastUpdate: '06/10/2025',
    },
    {
      id: 'cost-change',
      title: 'التغير في سعر التكلفة',
      description: 'ملخص التغييرات في تكلفة المنتجات لمعرفة تأثير كل منتج على صافي الربح',
      icon: 'pi pi-chart-line',
      iconColor: 'text-indigo-500',
      lastUpdate: '06/10/2025',
    },
    {
      id: 'inventory-summary',
      title: 'تقرير ملخص جرد المخزون',
      description: 'إحصائيات عن عمليات جرد المخزون وتأثيرها على الكميات في المخزن',
      icon: 'pi pi-box',
      iconColor: 'text-yellow-500',
      lastUpdate: '06/10/2025',
    },
    {
      id: 'supplier-summary',
      title: 'تقرير ملخص معاملات الموردين',
      description: 'نظرة عامة على الموردين مع تفاصيل مثل معلومات التواصل وإجمالي المعاملات والكميات المشتراة',
      icon: 'pi pi-users',
      iconColor: 'text-pink-500',
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
