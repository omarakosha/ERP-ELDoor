import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Transfer {
  id: number;
  invoiceNo: string;
  user: string;
  from: string;
  to: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  quantity: number;
}

@Component({
  selector: 'app-stock-transfer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    TagModule
  ],
  template: `
<div class="card p-4 shadow-md rounded-xl bg-white">
    <div class="flex flex-wrap justify-between items-center mb-4">
      <h2 class="text-xl font-semibold text-gray-700">Stock Transfer</h2>

      <div class="flex gap-2">
        <button pButton icon="pi pi-plus" label="New Transfer" class="p-button-success" (click)="openNewTransfer()"></button>
        <button pButton icon="pi pi-send" label="Initial Stock Request" class="p-button-info" (click)="openInitialRequest()"></button>
        <button pButton icon="pi pi-file-excel" label="Export Excel" class="p-button-success" (click)="exportExcel()"></button>
        <button pButton icon="pi pi-file-pdf" label="Export PDF" class="p-button-danger" (click)="exportPDF()"></button>
      </div>
    </div>

    <!-- General Search -->
    <div class="flex justify-between items-center mb-3">
      <input pInputText #filterInput placeholder="Search transfers by invoice number..." 
             (input)="onGlobalFilter(dt, $event)" class="w-full md:w-1/3">
    </div>

    <!-- Table -->
    <p-table #dt [value]="transfers" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[10,20,50]"
             [showGridlines]="true" responsiveLayout="scroll"
             [globalFilterFields]="['invoiceNo','user','from','to','status']">

      <ng-template pTemplate="header">
        <tr class="bg-gray-100 text-gray-700 text-sm">
          <th>Invoice No.</th>
          <th>User</th>
          <th>From</th>
          <th>To</th>
          <th>Creation Date</th>
          <th>Last Update</th>
          <th>Transfer Status</th>
          <th style="width: 120px;">Actions</th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-t>
        <tr class="hover:bg-gray-50">
          <td>{{t.invoiceNo}}</td>
          <td>{{t.user}}</td>
          <td>{{t.from}}</td>
          <td>{{t.to}}</td>
          <td>{{t.createdAt}}</td>
          <td>{{t.updatedAt}}</td>
          <td><p-tag [value]="t.status" [severity]="getSeverity(t.status)"></p-tag></td>
          <td class="flex gap-2 justify-center">
            <button pButton icon="pi pi-pencil" class="p-button-info p-button-sm" (click)="editTransfer(t)"></button>
            <button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" (click)="deleteTransfer(t)"></button>
          </td>
        </tr>
      </ng-template>
    </p-table>

    <!-- Add/Edit Transfer Dialog -->
    <p-dialog header="{{isEdit ? 'Edit Transfer' : 'New Transfer'}}" 
              [(visible)]="displayDialog" [modal]="true" [style]="{width:'480px'}">
      <div class="grid gap-3">
        <div>
          <label>Invoice No.</label>
          <input pInputText [(ngModel)]="currentTransfer.invoiceNo" class="w-full">
        </div>
        <div>
          <label>User</label>
          <input pInputText [(ngModel)]="currentTransfer.user" class="w-full">
        </div>
        <div>
          <label>From</label>
          <input pInputText [(ngModel)]="currentTransfer.from" class="w-full">
        </div>
        <div>
          <label>To</label>
          <input pInputText [(ngModel)]="currentTransfer.to" class="w-full">
        </div>
        <div>
          <label>Creation Date</label>
          <input type="date" pInputText [(ngModel)]="currentTransfer.createdAt" class="w-full">
        </div>
        <div>
          <label>Last Update</label>
          <input type="date" pInputText [(ngModel)]="currentTransfer.updatedAt" class="w-full">
        </div>
        <div>
          <label>Transfer Status</label>
          <input pInputText [(ngModel)]="currentTransfer.status" class="w-full">
        </div>
      </div>
      <ng-template pTemplate="footer">
        <button pButton label="Cancel" icon="pi pi-times" class="p-button-secondary" (click)="displayDialog=false"></button>
        <button pButton label="Save" icon="pi pi-check" class="p-button-success" (click)="saveTransfer()"></button>
      </ng-template>
    </p-dialog>

    <!-- Initial Stock Request Dialog -->
<p-dialog header="Initial Stock Request" [(visible)]="initialRequestDialog" [modal]="true" [style]="{width:'600px'}">
  <div class="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg">
    <!-- Select Destination Branch -->
    <div class="flex flex-col">
      <label class="font-semibold mb-1">Destination (Receiving Branch)</label>
      <input pInputText [(ngModel)]="destination" placeholder="Enter branch name" class="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
    </div>

    <!-- Search Products -->
    <div class="flex flex-col">
      <label class="font-semibold mb-1">Search Products</label>
      <input pInputText [(ngModel)]="productSearch" placeholder="Search by product name or SKU..." 
             (input)="filterProducts()" class="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
    </div>

    <!-- Matching Products List -->
    <div *ngIf="filteredProducts.length > 0" class="border rounded-md p-2 max-h-44 overflow-y-auto bg-white shadow-sm">
      <div *ngFor="let p of filteredProducts" 
           (click)="addProduct(p)" 
           class="cursor-pointer hover:bg-blue-50 p-2 rounded transition-colors flex justify-between items-center">
        <span>{{p.name}} ({{p.sku}})</span>
        <span class="text-gray-400 text-sm">Click to add</span>
      </div>
    </div>

    <!-- Selected Products Summary -->
    <div>
      <h3 class="font-semibold mt-3 mb-2 border-b pb-1">Selected Products Summary</h3>
      <div *ngIf="selectedProducts.length === 0" class="text-gray-500 italic">No products selected yet.</div>
      <table *ngIf="selectedProducts.length > 0" class="w-full text-sm border rounded">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-2 text-right">Product</th>
            <th class="p-2 text-center">Quantity</th>
            <th class="p-2 text-center">Remove</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of selectedProducts" class="border-t hover:bg-gray-50 transition-colors">
            <td class="p-2">{{p.name}}</td>
            <td class="p-2 text-center">
              <input type="number" [(ngModel)]="p.quantity" min="1" class="border rounded w-20 text-center p-1">
            </td>
            <td class="p-2 text-center">
              <button pButton icon="pi pi-times" class="p-button-danger p-button-rounded p-button-sm" (click)="removeProduct(p)"></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Control Buttons -->
  <ng-template pTemplate="footer">
    <div class="flex justify-end gap-2">
      <button pButton label="Cancel" icon="pi pi-times" class="p-button-secondary" (click)="initialRequestDialog=false"></button>
      <button pButton label="Submit Request" icon="pi pi-check" class="p-button-success" (click)="submitInitialRequest()"></button>
    </div>
  </ng-template>
</p-dialog>

</div>
  `
})
export class StockTransferComponent implements OnInit {
  @ViewChild('filterInput') filterInput!: ElementRef;
  transfers: Transfer[] = [];
  displayDialog = false;
  isEdit = false;
  currentTransfer: Transfer = { id: 0, invoiceNo: '', user: '', from: '', to: '', createdAt: '', updatedAt: '', status: 'قيد النقل' };

  // طلب مخزون مبدئي
  initialRequestDialog = false;
  destination = '';
  productSearch = '';
  products: Product[] = [
    { id: 1, name: 'منتج A', sku: 'SKU-001', quantity: 0 },
    { id: 2, name: 'منتج B', sku: 'SKU-002', quantity: 0 },
    { id: 3, name: 'منتج C', sku: 'SKU-003', quantity: 0 }
  ];
  filteredProducts: Product[] = [];
  selectedProducts: Product[] = [];

  ngOnInit() {
    this.transfers = [
      { id: 1, invoiceNo: 'TRF-1001', user: 'أحمد علي', from: 'المستودع الرئيسي', to: 'فرع جدة', createdAt: '2025-10-20', updatedAt: '2025-10-22', status: 'مكتمل' },
      { id: 2, invoiceNo: 'TRF-1002', user: 'سارة محمد', from: 'فرع الدمام', to: 'فرع الرياض', createdAt: '2025-10-18', updatedAt: '2025-10-19', status: 'قيد النقل' }
    ];
  }

  onGlobalFilter(table: Table, event: Event) {
    const input = event.target as HTMLInputElement | null;
    table.filterGlobal(input?.value ?? '', 'contains');
  }

  openNewTransfer() {
    this.currentTransfer = { id: 0, invoiceNo: '', user: '', from: '', to: '', createdAt: '', updatedAt: '', status: 'قيد النقل' };
    this.isEdit = false;
    this.displayDialog = true;
  }

  openInitialRequest() {
    this.initialRequestDialog = true;
  }

  filterProducts() {
    const term = this.productSearch.toLowerCase();
    this.filteredProducts = this.products.filter(p => p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term));
  }

  addProduct(p: Product) {
    if (!this.selectedProducts.find(sp => sp.id === p.id)) {
      this.selectedProducts.push({ ...p, quantity: 1 });
    }
    this.productSearch = '';
    this.filteredProducts = [];
  }

  removeProduct(p: Product) {
    this.selectedProducts = this.selectedProducts.filter(sp => sp.id !== p.id);
  }

  submitInitialRequest() {
    if (!this.destination.trim()) {
      alert('يرجى إدخال وجهة المخزون أولاً');
      return;
    }
    if (this.selectedProducts.length === 0) {
      alert('يرجى اختيار منتجات للطلب');
      return;
    }

    console.log('طلب مبدئي:', {
      destination: this.destination,
      products: this.selectedProducts
    });

    alert('تم إرسال طلب المخزون المبدئي بنجاح ✅');
    this.initialRequestDialog = false;
    this.destination = '';
    this.selectedProducts = [];
  }

  editTransfer(t: Transfer) {
    this.currentTransfer = { ...t };
    this.isEdit = true;
    this.displayDialog = true;
  }

  deleteTransfer(t: Transfer) {
    this.transfers = this.transfers.filter(x => x.id !== t.id);
  }

  saveTransfer() {
    if (this.isEdit) {
      const index = this.transfers.findIndex(x => x.id === this.currentTransfer.id);
      if (index !== -1) this.transfers[index] = { ...this.currentTransfer };
    } else {
      this.currentTransfer.id = this.transfers.length + 1;
      this.transfers.push({ ...this.currentTransfer });
    }
    this.displayDialog = false;
  }

  getSeverity(status: string) {
    switch (status.toLowerCase()) {
      case 'مكتمل': return 'success';
      case 'قيد النقل': return 'warn';
      case 'ملغي': return 'danger';
      default: return 'info';
    }
  }

  exportExcel() {
    const ws = XLSX.utils.json_to_sheet(this.transfers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'StockTransfers');
    XLSX.writeFile(wb, 'StockTransfers.xlsx');
  }

  exportPDF() {
    const doc = new jsPDF();
    doc.text('تحويلات المخزون', 14, 10);
    autoTable(doc, {
      head: [['رقم الفاتورة', 'المستخدم', 'من', 'إلى', 'تاريخ الإنشاء', 'آخر تحديث', 'الحالة']],
      body: this.transfers.map(t => [t.invoiceNo, t.user, t.from, t.to, t.createdAt, t.updatedAt, t.status])
    });
    doc.save('StockTransfers.pdf');
  }
}
