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
  selector: 'app-inventory-report',
  standalone: true,
  imports: [CommonModule, ReportCardComponent],
  templateUrl: './inventory-report.html',
})
export class InventoryReportComponent {
  @Input() favoriteReports: string[] = [];
  @Output() favoriteChanged = new EventEmitter<string>();

   reports: Report[] = [
    {
      id: 'current-stock',
      title: 'تقرير المخزون الحالي',
      description: 'عرض جميع المنتجات الموجودة في المخزون والكميات المتوفرة لكل منتج، مع إمكانية معرفة المنتجات التي قاربت على النفاد.',
      icon: 'pi pi-box',
      iconColor: 'text-green-500',
      lastUpdate: '06/10/2025',
    },
    {
      id: 'category-stock',
      title: 'تقرير المخزون حسب الفئات',
      description: 'تحليل المخزون بحسب تصنيفات المنتجات لتحديد أكثر الفئات تخزينًا والأكثر طلبًا من قبل العملاء.',
      icon: 'pi pi-tags',
      iconColor: 'text-blue-500',
      lastUpdate: '06/10/2025',
    },
    {
      id: 'low-stock',
      title: 'المنتجات المنخفضة في المخزون',
      description: 'قائمة بالمنتجات التي قاربت كمياتها على النفاد لتتمكن من إعادة الطلب في الوقت المناسب.',
      icon: 'pi pi-exclamation-triangle',
      iconColor: 'text-red-500',
      lastUpdate: '06/10/2025',
    },
    {
      id: 'over-stock',
      title: 'المنتجات الزائدة في المخزون',
      description: 'تحديد المنتجات التي لديها كميات كبيرة في المخزون لتفادي التكدس والخسائر الناتجة عن عدم بيعها.',
      icon: 'pi pi-box',
      iconColor: 'text-yellow-500',
      lastUpdate: '06/10/2025',
    },
    {
      id: 'product-movement',
      title: 'حركة المنتجات',
      description: 'متابعة جميع التحركات الواردة والصادرة للمنتجات من وإلى المخزون لتتمكن من معرفة المستويات الفعلية.',
      icon: 'pi pi-exchange',
      iconColor: 'text-indigo-500',
      lastUpdate: '06/10/2025',
    },
    {
      id: 'by-supplier',
      title: 'المنتجات حسب المورد',
      description: 'عرض المنتجات الموردة من كل مورد لتسهيل عمليات الطلب والتتبع.',
      icon: 'pi pi-truck',
      iconColor: 'text-teal-500',
      lastUpdate: '06/10/2025',
    },
    {
      id: 'by-location',
      title: 'المنتجات حسب الموقع',
      description: 'معرفة توزيع المنتجات في كل فرع أو مستودع لتسهيل عمليات النقل والبيع.',
      icon: 'pi pi-map',
      iconColor: 'text-purple-500',
      lastUpdate: '06/10/2025',
    },
    {
      id: 'category-demand',
      title: 'المنتجات حسب الفئة والطلب',
      description: 'تحليل المنتجات حسب الفئة وعدد الطلبات لتحديد المنتجات الأكثر رواجًا.',
      icon: 'pi pi-tags',
      iconColor: 'text-orange-500',
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
