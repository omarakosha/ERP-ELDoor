import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { SliderModule } from 'primeng/slider';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';


@Component({
  selector: 'app-report-table',
  standalone: true,
  imports: [CommonModule, 
    FormsModule, 
    TableModule, 
    ButtonModule,
    ProgressBarModule,
    TagModule,
    SliderModule, 
    MultiSelectModule, 
    InputIconModule, 
    IconFieldModule,
    TableModule,
    InputTextModule,
  ],
  templateUrl: './report-columns.component.html',
})
export class ReportTableComponent {

    selectedReportId: string | null = null;
  @Input() title!: string;
  @Input() data: any[] = [];
  @Input() rows: number = 10;
  @Input() loading: boolean = false;

  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() print = new EventEmitter<any>();
  

  clear(table: any) {
    table.clear();
  }

  onGlobalFilter(table: any, event: Event) {
    const input = event.target as HTMLInputElement;
    table.filterGlobal(input.value, 'contains');
  }

 get columns() {
  switch (this.selectedReportId) {

    // 🟩 تقرير المخزون الحالي
    case 'current-stock':
      return [
        { field: 'productCode', header: 'رمز المنتج' },
        { field: 'productName', header: 'اسم المنتج' },
        { field: 'category', header: 'الفئة' },
        { field: 'quantity', header: 'الكمية المتوفرة' },
        { field: 'unit', header: 'الوحدة' },
        { field: 'reorderLevel', header: 'حد إعادة الطلب' },
      ];

    // 🟦 تقرير المخزون حسب الفئات
    case 'category-stock':
      return [
        { field: 'category', header: 'الفئة' },
        { field: 'productCount', header: 'عدد المنتجات' },
        { field: 'totalQuantity', header: 'إجمالي الكمية' },
        { field: 'totalValue', header: 'إجمالي القيمة' },
      ];

    // 🟥 المنتجات المنخفضة في المخزون
    case 'low-stock':
      return [
        { field: 'productCode', header: 'رمز المنتج' },
        { field: 'productName', header: 'اسم المنتج' },
        { field: 'quantity', header: 'الكمية الحالية' },
        { field: 'reorderLevel', header: 'حد إعادة الطلب' },
        { field: 'difference', header: 'الكمية المطلوبة' },
      ];

    // 🟨 المنتجات الزائدة في المخزون
    case 'over-stock':
      return [
        { field: 'productCode', header: 'رمز المنتج' },
        { field: 'productName', header: 'اسم المنتج' },
        { field: 'quantity', header: 'الكمية الحالية' },
        { field: 'maxLevel', header: 'الحد الأعلى للمخزون' },
        { field: 'excess', header: 'الزيادة عن الحد' },
      ];

    // 🟪 حركة المنتجات
    case 'product-movement':
      return [
        { field: 'productCode', header: 'رمز المنتج' },
        { field: 'productName', header: 'اسم المنتج' },
        { field: 'movementType', header: 'نوع الحركة' },
        { field: 'quantity', header: 'الكمية' },
        { field: 'date', header: 'التاريخ' },
        { field: 'warehouse', header: 'المستودع' },
      ];

    // 🟫 المنتجات حسب المورد
    case 'by-supplier':
      return [
        { field: 'supplier', header: 'المورد' },
        { field: 'productCode', header: 'رمز المنتج' },
        { field: 'productName', header: 'اسم المنتج' },
        { field: 'lastPurchaseDate', header: 'آخر عملية شراء' },
        { field: 'quantity', header: 'الكمية المتوفرة' },
      ];

    // 🟩 المنتجات حسب الموقع
    case 'by-location':
      return [
        { field: 'location', header: 'الموقع' },
        { field: 'productCode', header: 'رمز المنتج' },
        { field: 'productName', header: 'اسم المنتج' },
        { field: 'quantity', header: 'الكمية' },
      ];

    // 🟧 المنتجات حسب الفئة والطلب
    case 'category-demand':
      return [
        { field: 'category', header: 'الفئة' },
        { field: 'productName', header: 'اسم المنتج' },
        { field: 'ordersCount', header: 'عدد الطلبات' },
        { field: 'totalQuantity', header: 'إجمالي الكمية المطلوبة' },
      ];

    // ⚪️ الافتراضي (بدون تقرير محدد)
    default:
      return [];
  }
}


  getSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | null {
    switch (status) {
      case 'active':
      case 'paid':
        return 'success';
      case 'pending':
        return 'warn';
      case 'unpaid':
      case 'inactive':
        return 'danger';
      default:
        return null;
    }
  }
}
