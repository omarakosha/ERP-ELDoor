import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';

import { ConfirmationService, MessageService } from 'primeng/api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LayoutService } from '@/layout/service/layout.service';
import { DatePickerModule } from 'primeng/datepicker';

interface Customer { id: number; name: string; }
interface Product { id: number; name: string; }
interface SaleItem { product: Product | null; quantity: number; price: number; }
interface Sale {
  invoiceNo: string;
  location: string;
  paymentMethod: string;
  customer: Customer | null;
  salesChannel: string;
  saleType: string;
  total: number;
  paid: number;
  createdAt: string;
  items: SaleItem[];
}

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    ToastModule,
    DatePickerModule,
    ConfirmDialogModule,

  ],
  providers: [ConfirmationService, MessageService],
  template: `
<div class="card p-6 bg-white shadow-md rounded-lg">
   <p-toast position="top-center" class="custom-toast"></p-toast>
   
  <!-- Toolbar Filters -->
  <div class="flex flex-wrap gap-2 justify-between p-2 rounded-t-lg mb-2">
    <div class="flex gap-2 flex-wrap">
      <button pButton label="Add Sale" icon="pi pi-plus" class="p-button-success" (click)="openNewSale()"outlined></button>
      <button pButton label="Export Excel" icon="pi pi-file-excel" class="p-button-info" (click)="exportExcel()"outlined></button>
      <button pButton label="Export PDF" icon="pi pi-file-pdf" class="p-button-danger" (click)="exportPDF()"outlined></button>
    </div>
 <div class="flex gap-2 flex-wrap items-center">

  <p-datepicker
      [(ngModel)]="filterDate"
      [showIcon]="true"
      [showButtonBar]="true"
      placeholder="End Date"
      styleClass="filter-control"
       [inputStyle]="{  width: '100%' }" 
      >
  </p-datepicker>

  <input pInputText type="text"
         placeholder="Search Invoice #"
         [(ngModel)]="filterInvoice"
         class="filter-control w-36 md:w-48">

  <input pInputText type="text"
         placeholder="Search Customer"
         [(ngModel)]="filterCustomer"
         class="filter-control w-36 md:w-48">

 

  <button pButton
          label="Clear Filters"
          icon="pi pi-filter-slash"
          class="filter-control p-button-outlined"
          (click)="dt.clear()">
  </button>

</div>

  </div>
<div class="overflow-x-auto rounded-lg shadow-sm">
  <p-table #dt 
           [value]="filteredSales" 
           [paginator]="true" 
           [rows]="10" 
           [rowsPerPageOptions]="[10,20,50]" 
           [responsiveLayout]="'scroll'" 
           class="min-w-full">

    <!-- Table Header -->
    <ng-template pTemplate="header">
      <tr class="bg-gray-100 text-gray-700 text-sm">
        <th *ngFor="let col of tableColumns" [style.min-width]="col.minWidth">
          <div class="flex justify-between items-center flex-nowrap min-w-0">
            <span class="truncate" [title]="col.header">{{col.header}}</span>
            <p-columnFilter [type]="col.filterType" [field]="col.field" display="menu" [placeholder]="col.filterPlaceholder"></p-columnFilter>
          </div>
        </th>
        <th style="min-width:120px;">Actions</th>
      </tr>
    </ng-template>

    <!-- Table Body -->
   <ng-template pTemplate="body" let-sale>
  <tr class="hover:bg-gray-50">
    <td class="truncate">{{sale.invoiceNo}}</td>
    <td class="truncate">{{sale.location}}</td>
    <td class="truncate">{{sale.paymentMethod}}</td>
    <td class="truncate">{{sale.customer?.name}}</td>
    <td class="truncate">{{sale.salesChannel}}</td>
    <td class="truncate">{{sale.saleType}}</td>

    <!-- Total -->
    <td>
      <div class="amount-cell">
        <img [src]="getRiyalIcon()" class="riyal-icon" alt="ريال سعودي"/>
        <span class="amount-value">{{sale.total | number:'1.2-2'}}</span>
      </div>
    </td>

    <!-- Paid -->
    <td>
      <div class="amount-cell">
        <img [src]="getRiyalIcon()" class="riyal-icon" alt="ريال سعودي"/>
        <span class="amount-value">{{sale.paid | number:'1.2-2'}}</span>
      </div>
    </td>

    <td class="truncate">{{sale.createdAt}}</td>

    <!-- Actions -->
    <td>
      <div class="flex gap-1 justify-center flex-wrap">
        <button pButton icon="pi pi-pencil" class="p-button-info p-button-sm" outlined (click)="editSale(sale)"></button>
        <button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" outlined (click)="confirmDelete(sale)"></button>
        <button pButton icon="pi pi-print" class="p-button-warning p-button-sm" outlined (click)="printSale(sale)"></button>
      </div>
    </td>
  </tr>
</ng-template>


    <!-- Empty Message -->
    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="10" class="text-center py-4 text-gray-500">
          No results found. Adjust filters to see data.
        </td>
      </tr>
    </ng-template>

  </p-table>
</div>


  <!-- Sale Dialog -->
  <p-dialog header="{{isEdit ? 'Edit' : 'New'}} Sale" [(visible)]="displayDialog" [modal]="true" [style]="{height:'90vw',width:'100vw', maxWidth:'700px'}" [closable]="false">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <label class="font-semibold block mb-1">Customer</label>
        <select [(ngModel)]="newSale.customer" class="p-inputtext w-full border rounded p-2">
          <option [ngValue]="null" disabled>Select Customer</option>
          <option *ngFor="let customer of customers" [ngValue]="customer">{{customer.name}}</option>
        </select>
      </div>
      <div>
        <label class="font-semibold block mb-1">Date</label>
      
          <p-datepicker
      [(ngModel)]="newSale.createdAt"
      [showIcon]="true"
      [showButtonBar]="true"
      placeholder="End Date"
      class="filter-control">
  </p-datepicker>
      </div>
    </div>

    <!-- Items Table -->
    <div class="mb-4">
      <button pButton label="Add Item" icon="pi pi-plus" class="p-button-secondary mb-2" (click)="addItem()"></button>
      <p-table [value]="newSale.items" class="overflow-auto rounded-lg shadow-sm">
        <ng-template pTemplate="header">
          <tr class="bg-gray-100 text-gray-700">
            <th>Product</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
            <th>Action</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-item let-i="rowIndex">
          <tr class="hover:bg-gray-50">
            <td>
              <select [(ngModel)]="item.product" class="p-inputtext w-full border rounded p-1">
                <option [ngValue]="null" disabled>Select product</option>
                <option *ngFor="let product of products" [ngValue]="product">{{product.name}}</option>
              </select>
            </td>
            <td><input type="number" min="1" [(ngModel)]="item.quantity" (ngModelChange)="calculateTotal()" class="p-inputtext w-full border rounded p-1"></td>
            <td><input type="number" min="0" [(ngModel)]="item.price" (ngModelChange)="calculateTotal()" class="p-inputtext w-full border rounded p-1"></td>
            
             <td>
      <div class="amount-cell">
        <img [src]="getRiyalIcon()" class="riyal-icon" alt="ريال سعودي"/>
        <span class="amount-value">{{item.quantity * item.price | number:'1.2-2'}}</span>
      </div>
    </td>
            <td>
              <button pButton icon="pi pi-times" class="p-button p-button-danger " (click)="removeItem(i)" outlined></button>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
<div class="text-right font-bold text-lg mb-2 flex justify-end items-center gap-1">
  <span>Total:</span>

  <span class="amount-cell">
    <img [src]="getRiyalIcon()" class="riyal-icon" alt="ريال سعودي" />
    <span class="amount-value">
      {{ newSale.total | number:'1.2-2' }}
    </span>
  </span>
</div>


    <ng-template pTemplate="footer">
      <button pButton label="Cancel" icon="pi pi-times" class="p-button-secondary" (click)="displayDialog=false"></button>
      <button pButton label="Save" icon="pi pi-check" class="p-button-success" (click)="saveSale()"></button>
    </ng-template>
  </p-dialog>

  <p-confirmDialog></p-confirmDialog>
</div>

  `
})
export class SalesInvoicesComponent {
  sales: Sale[] = [];
  customers: Customer[] = [];
  products: Product[] = [];
  newSale: Sale = { invoiceNo: '', location: '', paymentMethod: '', customer: null, salesChannel: 'POS', saleType: 'بيع', total: 0, paid: 0, createdAt: '', items: [] };
  displayDialog = false;
  isDarkMode = false; // true عند الدارك مود
  useSecondDarkIcon = false; // لتحديد أي نسخة من الداكن تريد

  isEdit = false;
  filterInvoice = '';
  filterCustomer = '';
  filterDate = '';

  tableColumns = [
    { header: 'Invoice #', field: 'invoiceNo', filterType: 'text', filterPlaceholder: 'بحث برقم الفاتورة', minWidth: '120px' },
    { header: 'Location', field: 'location', filterType: 'text', filterPlaceholder: 'بحث بالموقع', minWidth: '100px' },
    { header: 'Payment Method', field: 'paymentMethod', filterType: 'text', filterPlaceholder: 'بحث بطريقة الدفع', minWidth: '140px' },
    { header: 'Customer', field: 'customer.name', filterType: 'text', filterPlaceholder: 'بحث باسم العميل', minWidth: '160px' },
    { header: 'Sales Channel', field: 'salesChannel', filterType: 'text', filterPlaceholder: 'بحث بقناة البيع', minWidth: '120px' },
    { header: 'Sale Type', field: 'saleType', filterType: 'text', filterPlaceholder: 'بحث بنوع البيع', minWidth: '100px' },
    { header: 'Total', field: 'total', filterType: 'numeric', filterPlaceholder: 'بحث بالمجموع', minWidth: '100px' },
    { header: 'Paid', field: 'paid', filterType: 'numeric', filterPlaceholder: 'بحث بالمدفوع', minWidth: '100px' },
    { header: 'Created At', field: 'createdAt', filterType: 'date', filterPlaceholder: 'بحث بالتاريخ', minWidth: '120px' },
  ];

  constructor(private confirmationService: ConfirmationService, private messageService: MessageService, private layoutService: LayoutService) {
    this.customers = [
      { id: 1, name: 'ليلى بنت عبد العالى بن عامر' },
      { id: 2, name: 'أحمد محمد' },
      { id: 3, name: 'سارة علي' }
    ];
    this.products = [
      { id: 1, name: 'منتج 1' },
      { id: 2, name: 'منتج 2' },
      { id: 3, name: 'منتج 3' }
    ];
    this.sales = [
      { invoiceNo: 'S20250814-1', location: 'default', paymentMethod: 'شيك', customer: this.customers[0], salesChannel: 'POS', saleType: 'بيع', total: 17500, paid: 17500, createdAt: '2025-08-14', items: [] }
    ];
  }

  openNewSale() {
    this.newSale = { invoiceNo: '', location: 'default', paymentMethod: '', customer: null, salesChannel: 'POS', saleType: 'بيع', total: 0, paid: 0, createdAt: new Date().toISOString().substring(0, 10), items: [] };
    this.isEdit = false;
    this.displayDialog = true;
  }

  editSale(sale: Sale) {
    this.newSale = { ...sale, items: sale.items.map(i => ({ ...i })) };
    this.isEdit = true;
    this.displayDialog = true;
    this.calculateTotal();
  }

  confirmDelete(sale: Sale) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete invoice #${sale.invoiceNo}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteSale(sale)
    });
  }

  getRiyalIcon() {
    return this.layoutService.isDarkTheme()
      ? 'assets/icons/riyalsymbol-dark.png'  // أيقونة الداكن
      : 'assets/icons/riyalsymbol.png'; // أيقونة الفاتح
  }

  deleteSale(sale: Sale) {
    this.sales = this.sales.filter(s => s.invoiceNo !== sale.invoiceNo);
    this.messageService.clear();
    this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `Invoice #${sale.invoiceNo} deleted.` });
  }

  addItem() {
    this.newSale.items.push({ product: this.products[0], quantity: 1, price: 0 });
    this.calculateTotal();
  }

  removeItem(index: number) {
    this.newSale.items.splice(index, 1);
    this.calculateTotal();
  }

  calculateTotal() {
    this.newSale.total = this.newSale.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  }

  saveSale() {
    if (!this.newSale.customer) {
      this.messageService.clear();
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Please select a customer!' });
      return;
    }
    this.calculateTotal();
    if (!this.isEdit) {
      this.newSale.invoiceNo = 'S' + (20250000 + this.sales.length + 1);
      this.sales.push({ ...this.newSale });
      this.messageService.clear();
      this.messageService.add({ severity: 'success', summary: 'Saved', detail: `Invoice #${this.newSale.invoiceNo} added.` });
    } else {
      const idx = this.sales.findIndex(s => s.invoiceNo === this.newSale.invoiceNo);
      if (idx !== -1) this.sales[idx] = { ...this.newSale };
      this.messageService.clear();
      this.messageService.add({ severity: 'success', summary: 'Updated', detail: `Invoice #${this.newSale.invoiceNo} updated.` });
    }
    this.displayDialog = false;
  }

  get filteredSales() {
    return this.sales.filter(s => {
      const invoiceMatch = this.filterInvoice ? s.invoiceNo.toLowerCase().includes(this.filterInvoice.toLowerCase()) : true;
      const customerMatch = this.filterCustomer ? s.customer?.name.toLowerCase().includes(this.filterCustomer.toLowerCase()) : true;
      const dateMatch = this.filterDate ? s.createdAt === this.filterDate : true;
      return invoiceMatch && customerMatch && dateMatch;
    });
  }

  printSale(sale: Sale) {
    const content = `
      <div style="font-family:Arial,sans-serif;padding:20px;">
        <h2 style="text-align:center;">Invoice #${sale.invoiceNo}</h2>
        <p><strong>Customer:</strong> ${sale.customer?.name}</p>
        <p><strong>Date:</strong> ${sale.createdAt}</p>
        <table border="1" cellspacing="0" cellpadding="5" width="100%">
          <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
          <tbody>${sale.items.map(i => `
              <tr><td>${i.product?.name}</td><td>${i.quantity}</td><td>${i.price}</td><td>${i.quantity * i.price}</td></tr>
          `).join('')}</tbody>
        </table>
        <h3 style="text-align:right;">Total: ${sale.total}</h3>
      </div>
    `;
    const win = window.open('', '_blank');
    win!.document.write(content);
    win!.print();
  }

  exportExcel() {
    const ws = XLSX.utils.json_to_sheet(this.sales.map(s => ({
      'Invoice #': s.invoiceNo,
      'Location': s.location,
      'Payment Method': s.paymentMethod,
      'Customer': s.customer?.name,
      'Sales Channel': s.salesChannel,
      'Sale Type': s.saleType,
      'Total': s.total,
      'Paid': s.paid,
      'Created At': s.createdAt
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales');
    XLSX.writeFile(wb, 'Sales.xlsx');
  }

  exportPDF() {
    const doc = new jsPDF();
    doc.text('Sales Invoices', 14, 10);
    autoTable(doc, {
      head: [['Invoice #', 'Location', 'Payment', 'Customer', 'Channel', 'Type', 'Total', 'Paid', 'Created At']],
      body: this.sales.map(s => [
        s.invoiceNo || '',
        s.location || '',
        s.paymentMethod || '',
        s.customer?.name || '',
        s.salesChannel || '',
        s.saleType || '',
        s.total ?? 0,
        s.paid ?? 0,
        s.createdAt || ''
      ])

    });
    doc.save('SalesInvoices.pdf');
  }
}
