import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Inventory {
  id: number;
  name: string;
  createdAt: string;
  location: string;
  totalCost: number;
  status: string;
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    ToastModule,
    TagModule
  ],
  template: `
  <div class="card p-4 shadow-md rounded-xl bg-white">
    <div class="flex flex-wrap justify-between items-center mb-4">
      <h2 class="text-xl font-semibold text-gray-700">جرد المخزون</h2>

      <div class="flex gap-2">
        <button pButton icon="pi pi-plus" label="إضافة جرد جديد" class="p-button-success" (click)="openNew()"></button>
        <button pButton icon="pi pi-file-excel" label="تصدير Excel" class="p-button-success" (click)="exportExcel()"></button>
        <button pButton icon="pi pi-file-pdf" label="تصدير PDF" class="p-button-danger" (click)="exportPDF()"></button>
      </div>
    </div>

    <!-- حقل البحث العام -->
    <div class="flex justify-between items-center mb-3">
      <input pInputText #filterInput placeholder="البحث بواسطة رقم الجرد أو اسم الجرد..." (input)="onGlobalFilter(dt, $event)" class="w-full md:w-1/3">
    </div>

    <!-- الجدول -->
    <p-table #dt [value]="inventories" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[10,20,50]"
             [showGridlines]="true" responsiveLayout="scroll"
             [globalFilterFields]="['id','name','location','status']">

      <ng-template pTemplate="header">
        <tr class="bg-gray-100 text-gray-700 text-sm">
          <th>
            <div class="flex justify-between items-center">
              <span>رقم الجرد</span>
              <p-columnFilter type="text" field="id" display="menu" placeholder="بحث"></p-columnFilter>
            </div>
          </th>
          <th>
            <div class="flex justify-between items-center">
              <span>اسم الجرد</span>
              <p-columnFilter type="text" field="name" display="menu" placeholder="بحث"></p-columnFilter>
            </div>
          </th>
          <th>
            <div class="flex justify-between items-center">
              <span>تاريخ الإنشاء</span>
              <p-columnFilter type="date" field="createdAt" display="menu"></p-columnFilter>
            </div>
          </th>
          <th>
            <div class="flex justify-between items-center">
              <span>الموقع</span>
              <p-columnFilter type="text" field="location" display="menu" placeholder="بحث"></p-columnFilter>
            </div>
          </th>
          <th>
            <div class="flex justify-between items-center">
              <span>إجمالي التكلفة</span>
              <p-columnFilter type="numeric" field="totalCost" display="menu"></p-columnFilter>
            </div>
          </th>
          <th>
            <div class="flex justify-between items-center">
              <span>حالة الجرد</span>
              <p-columnFilter type="text" field="status" display="menu"></p-columnFilter>
            </div>
          </th>
          <th style="width: 120px;">الإجراءات</th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-item>
        <tr class="hover:bg-gray-50">
          <td>{{item.id}}</td>
          <td>{{item.name}}</td>
          <td>{{item.createdAt}}</td>
          <td>{{item.location}}</td>
          <td>{{item.totalCost | currency:'SAR':'symbol':'1.2-2'}}</td>
          <td><p-tag [value]="item.status" [severity]="getSeverity(item.status)"></p-tag></td>
          <td class="flex gap-2 justify-center">
            <button pButton icon="pi pi-pencil" class="p-button-info p-button-sm" (click)="editInventory(item)"></button>
            <button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" (click)="deleteInventory(item)"></button>
          </td>
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="7" class="text-center py-4 text-gray-500">
            لا يوجد نتائج لعرضها. برجاء تعديل البحث أو الفلاتر للعثور على ما تبحث عنه.
          </td>
        </tr>
      </ng-template>
    </p-table>

    <!-- نافذة إضافة / تعديل -->
    <p-dialog header="{{isEdit ? 'تعديل جرد' : 'إضافة جرد جديد'}}" [(visible)]="displayDialog" [modal]="true" [style]="{width:'450px'}">
      <div class="grid gap-3">
        <div>
          <label>رقم الجرد</label>
          <input pInputText type="number" [(ngModel)]="currentInventory.id" class="w-full">
        </div>
        <div>
          <label>اسم الجرد</label>
          <input pInputText [(ngModel)]="currentInventory.name" class="w-full">
        </div>
        <div>
          <label>تاريخ الإنشاء</label>
          <input pInputText type="date" [(ngModel)]="currentInventory.createdAt" class="w-full">
        </div>
        <div>
          <label>الموقع</label>
          <input pInputText [(ngModel)]="currentInventory.location" class="w-full">
        </div>
        <div>
          <label>إجمالي التكلفة</label>
          <input pInputText type="number" [(ngModel)]="currentInventory.totalCost" class="w-full">
        </div>
        <div>
          <label>حالة الجرد</label>
          <input pInputText [(ngModel)]="currentInventory.status" class="w-full">
        </div>
      </div>
      <ng-template pTemplate="footer">
        <button pButton label="إلغاء" icon="pi pi-times" (click)="displayDialog=false" class="p-button-secondary"></button>
        <button pButton label="حفظ" icon="pi pi-check" (click)="saveInventory()" class="p-button-success"></button>
      </ng-template>
    </p-dialog>
  </div>
  `
})
export class InventoryComponent implements OnInit {
  @ViewChild('filterInput') filterInput!: ElementRef;
  inventories: Inventory[] = [];
  displayDialog = false;
  isEdit = false;
  currentInventory: Inventory = { id: 0, name: '', createdAt: '', location: '', totalCost: 0, status: 'نشط' };

  ngOnInit() {
    this.inventories = [
      { id: 101, name: 'جرد أكتوبر', createdAt: '2025-10-20', location: 'المستودع الرئيسي', totalCost: 12400, status: 'نشط' },
      { id: 102, name: 'جرد فرع جدة', createdAt: '2025-09-18', location: 'فرع جدة', totalCost: 8900, status: 'منتهي' }
    ];
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openNew() {
    this.currentInventory = { id: 0, name: '', createdAt: '', location: '', totalCost: 0, status: 'نشط' };
    this.isEdit = false;
    this.displayDialog = true;
  }

  editInventory(item: Inventory) {
    this.currentInventory = { ...item };
    this.isEdit = true;
    this.displayDialog = true;
  }

  deleteInventory(item: Inventory) {
    this.inventories = this.inventories.filter(i => i.id !== item.id);
  }

  saveInventory() {
    if (this.isEdit) {
      const index = this.inventories.findIndex(i => i.id === this.currentInventory.id);
      if (index !== -1) this.inventories[index] = { ...this.currentInventory };
    } else {
      this.inventories.push({ ...this.currentInventory });
    }
    this.displayDialog = false;
  }

  getSeverity(status: string) {
    switch (status.toLowerCase()) {
      case 'نشط': return 'success';
      case 'منتهي': return 'danger';
      default: return 'info';
    }
  }

  exportExcel() {
    const ws = XLSX.utils.json_to_sheet(this.inventories);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
    XLSX.writeFile(wb, 'Inventory.xlsx');
  }

  exportPDF() {
    const doc = new jsPDF();
    doc.text('جرد المخزون', 14, 10);
    autoTable(doc, {
      head: [['رقم الجرد', 'اسم الجرد', 'تاريخ الإنشاء', 'الموقع', 'إجمالي التكلفة', 'الحالة']],
      body: this.inventories.map(i => [i.id, i.name, i.createdAt, i.location, i.totalCost, i.status])
    });
    doc.save('Inventory.pdf');
  }
}
