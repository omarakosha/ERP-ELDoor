import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';

interface Product {
  name: string;
  sku: string;
  newPrice: number;
  newPriceWithTax: number;
  taxCode: string;
  taxValue: number;
  purchasePrice: number;
  quantity: number;
  availableQuantity: number;
}

interface PurchaseReturn {
  id: number;
  invoiceNo: string;
  createdAt: string;
  supplier: string;
  location: string;
  invoiceType: string;
  status: string;
  paymentStatus: string;
}

@Component({
  selector: 'app-purchase-returns',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    TagModule,
  
  ],
  template: `
  <div class="card p-4 shadow-md rounded-xl bg-white">
    <div class="flex flex-wrap justify-between items-center mb-4">
      <h2 class="text-xl font-semibold text-gray-700">مردودات المشتريات</h2>
      <button pButton icon="pi pi-plus" label="إضافة مردود جديد" class="p-button-success" (click)="openNewReturn()"></button>
    </div>

    <!-- البحث -->
    <div class="flex flex-wrap justify-between items-center mb-3 gap-2">
      <input pInputText #filterInput placeholder="ابحث عن المردودات..." 
             (input)="onGlobalFilter(dt, $event)" class="w-full md:w-1/3">
      <input type="date" [(ngModel)]="filterDate" placeholder="تاريخ الإنشاء" class="border rounded p-2 w-48">
    </div>

    <!-- الجدول -->
    <p-table #dt [value]="returns" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[10,20,50]"
             [showGridlines]="true" responsiveLayout="scroll"
             [globalFilterFields]="['invoiceNo','supplier','location','invoiceType','status','paymentStatus']">

      <ng-template pTemplate="header">
        <tr class="bg-gray-100 text-gray-700 text-sm">
          <th>رقم الفاتورة</th>
          <th>تاريخ الإنشاء</th>
          <th>المورد</th>
          <th>الموقع</th>
          <th>نوع الفاتورة</th>
          <th>الحالة</th>
          <th>حالة الدفع</th>
          <th style="width: 120px;">الإجراءات</th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-r>
        <tr class="hover:bg-gray-50">
          <td>{{r.invoiceNo}}</td>
          <td>{{r.createdAt}}</td>
          <td>{{r.supplier}}</td>
          <td>{{r.location}}</td>
          <td>{{r.invoiceType}}</td>
          <td><p-tag [value]="r.status" [severity]="getSeverity(r.status)"></p-tag></td>
          <td><p-tag [value]="r.paymentStatus" [severity]="getPaymentSeverity(r.paymentStatus)"></p-tag></td>
          <td class="flex gap-2 justify-center">
            <button pButton icon="pi pi-pencil" class="p-button-info p-button-sm" (click)="editReturn(r)"></button>
            <button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" (click)="deleteReturn(r)"></button>
          </td>
        </tr>
      </ng-template>
    </p-table>

    
    <p-dialog header="مردود مشتريات جديد" [(visible)]="displayDialog" [modal]="true" [style]="{width:'950px'}" [closable]="false">
  <div class="space-y-6 p-5 bg-gray-50 rounded-md">

    <!-- بيانات المردود -->
    <div class="bg-white border rounded-md shadow-sm p-5">
      <h3 class="font-semibold text-gray-700 mb-4">بيانات المردود</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block mb-1 font-medium text-gray-600">المورد</label>
          <input pInputText [(ngModel)]="currentReturn.supplier" placeholder="أدخل اسم المورد" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-200">
        </div>
        <div>
          <label class="block mb-1 font-medium text-gray-600">الموقع</label>
          <input pInputText [(ngModel)]="currentReturn.location" placeholder="الموقع أو الفرع" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-200">
        </div>
        <div>
          <label class="block mb-1 font-medium text-gray-600">رقم فاتورة المورد</label>
          <input pInputText [(ngModel)]="currentReturn.invoiceNo" placeholder="رقم الفاتورة" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-200">
        </div>
        <div>
          <label class="block mb-1 font-medium text-gray-600">الرقم المرجعي</label>
          <input pInputText [(ngModel)]="currentReturn.referenceNo" placeholder="رقم مرجعي داخلي" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-200">
        </div>
        <div class="md:col-span-2">
          <label class="block mb-1 font-medium text-gray-600">ملاحظات</label>
          <input pInputText [(ngModel)]="currentReturn.notes" placeholder="إضافة ملاحظات إن وجدت" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-200">
        </div>
      </div>
    </div>

    <!-- إضافة المنتجات -->
    <div class="bg-white border rounded-md shadow-sm p-5">
      <h3 class="font-semibold text-gray-700 mb-4">إضافة المنتجات</h3>
      <input pInputText [(ngModel)]="productSearch" placeholder="بحث باسم المنتج أو SKU" 
             (input)="filterProducts()" class="w-full p-3 border rounded-lg mb-3 focus:ring-2 focus:ring-blue-200">

      <div *ngIf="filteredProducts.length > 0" class="border rounded-md p-2 max-h-48 overflow-y-auto bg-white shadow-inner">
        <div *ngFor="let p of filteredProducts" (click)="addProduct(p)" 
             class="cursor-pointer hover:bg-blue-50 transition-colors duration-150 p-2 rounded flex justify-between items-center">
          <span class="font-medium">{{p.name}} ({{p.sku}})</span>
          <span class="text-gray-500 text-xs">متوفر: {{p.availableQuantity}}</span>
        </div>
      </div>

      <div *ngIf="selectedProducts.length > 0" class="overflow-x-auto mt-4">
        <table class="min-w-full text-sm border border-gray-200 rounded-lg table-fixed">
          <thead class="bg-gray-100">
            <tr>
              <th class="p-3 text-right w-2/12">المنتج</th>
              <th class="p-3 text-right w-2/12">SKU</th>
              <th class="p-3 text-right w-1/12">السعر</th>
              <th class="p-3 text-right w-1/12">السعر + ضريبة</th>
              <th class="p-3 text-right w-1/12">الكمية</th>
              <th class="p-3 text-right w-1/12">المتاح</th>
              <th class="p-3 text-right w-2/12">المجموع</th>
              <th class="p-3 text-center w-1/12">حذف</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of selectedProducts" class="hover:bg-blue-50 transition-colors duration-150">
              <td class="p-2 text-right truncate">{{p.name}}</td>
              <td class="p-2 text-right">{{p.sku}}</td>
              <td class="p-2">
                <input type="number" [(ngModel)]="p.newPrice" min="0"
                       class="w-full text-center border border-gray-300 rounded-md p-2 focus:ring-1 focus:ring-blue-300">
              </td>
              <td class="p-2">
                <input type="number" [(ngModel)]="p.newPriceWithTax" min="0"
                       class="w-full text-center border border-gray-300 rounded-md p-2 focus:ring-1 focus:ring-blue-300">
              </td>
              <td class="p-2">
                <input type="number" [(ngModel)]="p.quantity" min="1" [max]="p.availableQuantity"
                       class="w-full text-center border border-gray-300 rounded-md p-2 focus:ring-1 focus:ring-blue-300">
              </td>
              <td class="p-2 text-right">{{p.availableQuantity}}</td>
              <td class="p-2 text-right font-semibold">{{(p.quantity || 0) * (p.newPrice || 0)}}</td>
              <td class="p-2 text-center">
                <button pButton icon="pi pi-times" class="p-button-danger p-button-rounded p-button-sm" (click)="removeProduct(p)"></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="selectedProducts.length === 0" class="text-gray-500 mt-2">ﻻ يوجد منتجات مختارة</div>
    </div>

    <!-- الدفع والحسابات -->
    <div class="bg-white border rounded-md shadow-sm p-5">
      <h3 class="font-semibold text-gray-700 mb-4">خيارات الدفع والحسابات</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="font-medium">وسيلة الدفع</label>
          <input pInputText [(ngModel)]="paymentMethod" placeholder="مثال: نقدي، تحويل" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-200">
        </div>
        <div>
          <label class="font-medium">المبلغ المدفوع</label>
          <input type="number" [(ngModel)]="paymentAmount" class="w-full p-2 border rounded-lg">
        </div>
        <div class="flex flex-col justify-end bg-gray-50 p-3 rounded border">
          <p class="text-gray-700">الإجمالي غير شامل الضريبة: <span class="font-semibold">{{getSubtotal()}}</span></p>
          <p class="text-gray-700">قيمة الضريبة: <span class="font-semibold">{{getTotalTax()}}</span></p>
          <p class="text-gray-700">الإجمالي شامل الضريبة: <span class="font-semibold">{{getTotal()}}</span></p>
          <p class="text-gray-700">المبلغ المستحق: <span class="font-semibold">{{getTotal() - paymentAmount}}</span></p>
        </div>
      </div>
    </div>

  </div>

  <ng-template pTemplate="footer">
    <button pButton label="إلغاء" icon="pi pi-times" class="p-button-secondary" (click)="displayDialog=false"></button>
    <button pButton label="حفظ" icon="pi pi-check" class="p-button-success" (click)="saveReturn()"></button>
  </ng-template>
</p-dialog>


  </div>
  `
})
export class PurchaseReturnsComponent implements OnInit {
  @ViewChild('filterInput') filterInput!: ElementRef;
  returns: PurchaseReturn[] = [];
  filterDate: string = '';

  // متغيرات نافذة المردود
  displayDialog: boolean = false;
  currentReturn: any = {
    supplier: '',
    location: '',
    invoiceNo: '',
    referenceNo: '',
    notes: ''
  };

  // متغيرات المنتجات
  productSearch: string = '';
  filteredProducts: Product[] = [];
  selectedProducts: Product[] = [];

  // متغيرات الدفع
  paymentMethod: string = '';
  paymentAmount: number = 0;

  // مثال على المنتجات للبحث
  products: Product[] = [
    { name: 'منتج 1', sku: 'SKU001', newPrice: 0, newPriceWithTax: 0, taxCode: 'VAT5', taxValue: 0, purchasePrice: 100, quantity: 1, availableQuantity: 10 },
    { name: 'منتج 2', sku: 'SKU002', newPrice: 0, newPriceWithTax: 0, taxCode: 'VAT5', taxValue: 0, purchasePrice: 200, quantity: 1, availableQuantity: 5 }
  ];

  ngOnInit() {
    this.returns = [
      { id: 1, invoiceNo: 'PR-1001', createdAt: '2025-10-20', supplier: 'مؤسسة النور', location: 'فرع الرياض', invoiceType: 'مشتريات', status: 'مكتمل', paymentStatus: 'مدفوع' },
      { id: 2, invoiceNo: 'PR-1002', createdAt: '2025-10-22', supplier: 'شركة السريع', location: 'فرع جدة', invoiceType: 'مشتريات', status: 'قيد المعالجة', paymentStatus: 'غير مدفوع' }
    ];
  }

  onGlobalFilter(table: Table, event: Event) {
    const input = event.target as HTMLInputElement | null;
    table.filterGlobal(input?.value ?? '', 'contains');
  }

  getSeverity(status: string) {
    switch (status.toLowerCase()) {
      case 'مكتمل': return 'success';
      case 'قيد المعالجة': return 'warn';
      case 'ملغي': return 'danger';
      default: return 'info';
    }
  }

  getPaymentSeverity(paymentStatus: string) {
    switch (paymentStatus.toLowerCase()) {
      case 'مدفوع': return 'success';
      case 'غير مدفوع': return 'warn';
      default: return 'info';
    }
  }

  openNewReturn() {
    this.displayDialog = true;
    this.currentReturn = { supplier: '', location: '', invoiceNo: '', referenceNo: '', notes: '' };
    this.selectedProducts = [];
    this.productSearch = '';
    this.filteredProducts = [];
    this.paymentMethod = '';
    this.paymentAmount = 0;
  }

  // دوال المنتجات
  filterProducts() {
    const search = this.productSearch.toLowerCase();
    this.filteredProducts = this.products.filter(p => 
      p.name.toLowerCase().includes(search) || p.sku.toLowerCase().includes(search)
    );
  }

  addProduct(p: Product) {
    if (!this.selectedProducts.includes(p)) {
      this.selectedProducts.push({ ...p }); // clone لتجنب التغيير بالمنتج الأصلي
    }
    this.productSearch = '';
    this.filteredProducts = [];
  }

  removeProduct(p: Product) {
    this.selectedProducts = this.selectedProducts.filter(x => x !== p);
  }

  // دوال الحساب
  getSubtotal() {
    return this.selectedProducts.reduce((sum, p) => sum + (p.newPrice * p.quantity), 0);
  }

  getTotalTax() {
    return this.selectedProducts.reduce((sum, p) => sum + (p.taxValue * p.quantity), 0);
  }

  getTotal() {
    return this.getSubtotal() + this.getTotalTax();
  }

  // حفظ المردود
  saveReturn() {
    console.log('حفظ المردود:', this.currentReturn, this.selectedProducts, this.paymentMethod, this.paymentAmount);
    this.displayDialog = false;
  }

  editReturn(r: PurchaseReturn) {
    alert(`تعديل المردود رقم ${r.invoiceNo}`);
  }

  deleteReturn(r: PurchaseReturn) {
    this.returns = this.returns.filter(x => x.id !== r.id);
  }
}
