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

interface Supplier { id:number; name:string; }
interface Product { id:number; name:string; }
interface POItem { product: Product|null; quantity:number; price:number; }
interface PurchaseOrder {
  id: string;
  supplier: Supplier|null;
  date: string;
  status: string;
  items: POItem[];
  total: number;
}

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, TableModule, DialogModule,
    ConfirmDialogModule, InputTextModule, ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
<div class="card p-6 bg-white shadow-md rounded-lg">
  <p-toast></p-toast>
  <h2 class="text-3xl font-bold mb-6 text-center md:text-left">📦 Purchase Orders</h2>

  <!-- Toolbar Filters -->
  <div class="flex flex-wrap gap-2 justify-between p-2 rounded-t-lg mb-2">
    <div class="flex gap-2 flex-wrap">
      <button pButton label="Add PO" icon="pi pi-plus" class="p-button-success" (click)="openNewPO()"></button>
      <button pButton label="Export Excel" icon="pi pi-file-excel" class="p-button-success" (click)="exportExcel()"></button>
      <button pButton label="Export PDF" icon="pi pi-file-pdf" class="p-button-danger" (click)="exportPDF()"></button>
    </div>
    <div class="flex gap-2 flex-wrap items-center">
      <input pInputText type="text" placeholder="Search PO #" [(ngModel)]="filterPO" class="p-inputtext border rounded p-2 w-36 md:w-48">
      <input pInputText type="text" placeholder="Search Supplier" [(ngModel)]="filterSupplier" class="p-inputtext border rounded p-2 w-36 md:w-48">
      <input pInputText type="date" [(ngModel)]="filterDate" class="p-inputtext border rounded p-2 w-32 md:w-40">
      <input pInputText type="text" placeholder="Search Status" [(ngModel)]="filterStatus" class="p-inputtext border rounded p-2 w-32 md:w-40">
    </div>
  </div>

  <p-table [value]="filteredPOs" [paginator]="true" [rows]="10" [responsiveLayout]="'scroll'" [rowsPerPageOptions]="[10,20,50]" class="overflow-auto rounded-lg shadow-sm">
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

    <ng-template pTemplate="body" let-po>
      <tr class="hover:bg-gray-50">
        <td>{{po.id}}</td>
        <td>{{po.supplier?.name}}</td>
        <td>{{po.date}}</td>
        <td>{{po.total | currency:'SAR'}}</td>
        <td><span [ngClass]="statusClass(po.status)">{{po.status}}</span></td>
        <td class="flex gap-2 justify-center">
          <button pButton icon="pi pi-pencil" class="p-button-info p-button-sm" (click)="editPO(po)"></button>
          <button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" (click)="confirmDelete(po)"></button>
          <button pButton icon="pi pi-print" class="p-button-warning p-button-sm" (click)="printPO(po)"></button>
        </td>
      </tr>
    </ng-template>

    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="6" class="text-center py-4 text-gray-500">
          No results found. Please adjust your search or filters to find what you are looking for.
        </td>
      </tr>
    </ng-template>
  </p-table>


  <!-- PO Dialog -->
  <p-dialog header="{{isEdit ? 'Edit' : 'New'}} Purchase Order" [(visible)]="displayDialog" [modal]="true" [style]="{width:'90vw', maxWidth:'700px'}" [closable]="false">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <label class="font-semibold block mb-1">Supplier</label>
        <select [(ngModel)]="newPO.supplier" class="p-inputtext w-full border rounded p-2">
          <option [ngValue]="null" disabled>Select Supplier</option>
          <option *ngFor="let supplier of suppliers" [ngValue]="supplier">{{supplier.name}}</option>
        </select>
      </div>
      <div>
        <label class="font-semibold block mb-1">Date</label>
        <input type="date" [(ngModel)]="newPO.date" class="p-inputtext w-full border rounded p-2"/>
      </div>
      <div>
        <label class="font-semibold block mb-1">Status</label>
        <select [(ngModel)]="newPO.status" class="p-inputtext w-full border rounded p-2">
          <option value="New">New</option>
          <option value="Approved">Approved</option>
          <option value="Received">Received</option>
        </select>
      </div>
    </div>

    <!-- Items Table -->
    <div class="mb-4">
      <button pButton label="Add Item" icon="pi pi-plus" class="p-button-secondary mb-2" (click)="addItem()"></button>
      <p-table [value]="newPO.items" class="overflow-auto rounded-lg shadow-sm">
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
            <td>{{item.quantity * item.price | currency:'SAR'}}</td>
            <td>
              <button pButton icon="pi pi-times" class="p-button-rounded p-button-danger p-button-sm" (click)="removeItem(i)"></button>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <div class="text-right font-bold text-lg mb-2">Total: {{newPO.total | currency:'SAR'}}</div>

    <ng-template pTemplate="footer">
      <button pButton label="Cancel" icon="pi pi-times" class="p-button-secondary" (click)="displayDialog=false"></button>
      <button pButton label="Save" icon="pi pi-check" class="p-button-success" (click)="savePO()"></button>
    </ng-template>
  </p-dialog>

  <p-confirmDialog></p-confirmDialog>
</div>

  `
})
export class PurchaseOrdersComponent {
  purchaseOrders: PurchaseOrder[] = [];
  suppliers: Supplier[] = [];
  products: Product[] = [];
  newPO: PurchaseOrder = { id:'', supplier:null, date:'', status:'New', items:[], total:0 };
  displayDialog = false;
  isEdit = false;

  filterPO = '';
  filterSupplier = '';
  filterDate = '';
  filterStatus = '';

  tableColumns = [
    { header:'PO #', field:'id', filterType:'text', filterPlaceholder:'بحث برقم PO', minWidth:'120px' },
    { header:'Supplier', field:'supplier.name', filterType:'text', filterPlaceholder:'بحث بالمورد', minWidth:'160px' },
    { header:'Date', field:'date', filterType:'date', filterPlaceholder:'بحث بالتاريخ', minWidth:'120px' },
    { header:'Total', field:'total', filterType:'numeric', filterPlaceholder:'بحث بالمجموع', minWidth:'100px' },
    { header:'Status', field:'status', filterType:'text', filterPlaceholder:'بحث بالحالة', minWidth:'120px' }
  ];

  constructor(private confirmationService: ConfirmationService, private messageService: MessageService) {
    this.suppliers = [
      { id:1, name:'Supplier A'}, { id:2, name:'Supplier B'}, { id:3, name:'Supplier C'}
    ];
    this.products = [
      { id:1, name:'Product 1'}, { id:2, name:'Product 2'}, { id:3, name:'Product 3'}
    ];
    this.purchaseOrders = [
      { id:'PO-001', supplier:this.suppliers[0], date:'2025-09-24', status:'New', items:[], total:1200 }
    ];
  }

  statusClass(status: string) {
    return {
      'text-blue-600 font-bold': status==='New',
      'text-green-600 font-bold': status==='Approved',
      'text-orange-600 font-bold': status==='Received'
    };
  }

  get filteredPOs() {
    return this.purchaseOrders.filter(po=>{
      const poMatch = this.filterPO ? po.id.toLowerCase().includes(this.filterPO.toLowerCase()) : true;
      const supplierMatch = this.filterSupplier ? po.supplier?.name.toLowerCase().includes(this.filterSupplier.toLowerCase()) : true;
      const dateMatch = this.filterDate ? po.date === this.filterDate : true;
      const statusMatch = this.filterStatus ? po.status.toLowerCase().includes(this.filterStatus.toLowerCase()) : true;
      return poMatch && supplierMatch && dateMatch && statusMatch;
    });
  }

  openNewPO() {
    this.newPO = { id:'', supplier:null, date:new Date().toISOString().substring(0,10), status:'New', items:[], total:0 };
    this.isEdit = false;
    this.displayDialog = true;
  }

  editPO(po: PurchaseOrder) {
    this.newPO = { ...po, items: po.items.map(i=>({...i})) };
    this.isEdit = true;
    this.displayDialog = true;
    this.calculateTotal();
  }

  confirmDelete(po: PurchaseOrder) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete PO #${po.id}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deletePO(po)
    });
  }

  deletePO(po: PurchaseOrder) {
    this.purchaseOrders = this.purchaseOrders.filter(p => p.id !== po.id);
    this.messageService.add({severity:'success', summary:'Deleted', detail:`PO #${po.id} deleted.`});
  }

  addItem() {
    this.newPO.items.push({ product:this.products[0], quantity:1, price:0 });
    this.calculateTotal();
  }

  removeItem(index:number) {
    this.newPO.items.splice(index,1);
    this.calculateTotal();
  }

  calculateTotal() {
    this.newPO.total = this.newPO.items.reduce((sum,item) => sum + (item.quantity*item.price),0);
  }

  savePO() {
    if(!this.newPO.supplier){
      this.messageService.add({severity:'warn', summary:'Validation', detail:'Please select a supplier!'});
      return;
    }
    this.calculateTotal();
    if(!this.isEdit){
      this.newPO.id = 'PO-' + (1000 + this.purchaseOrders.length + 1);
      this.purchaseOrders.push({...this.newPO});
      this.messageService.add({severity:'success', summary:'Saved', detail:`PO #${this.newPO.id} added.`});
    } else {
      const idx = this.purchaseOrders.findIndex(p=>p.id===this.newPO.id);
      if(idx!==-1) this.purchaseOrders[idx] = {...this.newPO};
      this.messageService.add({severity:'success', summary:'Updated', detail:`PO #${this.newPO.id} updated.`});
    }
    this.displayDialog=false;
  }

  printPO(po: PurchaseOrder) {
    const content = `
      <div style="font-family:Arial,sans-serif;padding:20px;">
        <h2 style="text-align:center;">PO #${po.id}</h2>
        <p><strong>Supplier:</strong> ${po.supplier?.name}</p>
        <p><strong>Date:</strong> ${po.date}</p>
        <p><strong>Status:</strong> ${po.status}</p>
        <table border="1" cellspacing="0" cellpadding="5" width="100%">
          <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
          <tbody>${po.items.map(i=>`
              <tr><td>${i.product?.name}</td><td>${i.quantity}</td><td>${i.price}</td><td>${i.quantity*i.price}</td></tr>
          `).join('')}</tbody>
        </table>
        <h3 style="text-align:right;">Total: ${po.total}</h3>
      </div>
    `;
    const win = window.open('', '_blank');
    win!.document.write(content);
    win!.print();
  }

  exportExcel() {
    const ws = XLSX.utils.json_to_sheet(this.filteredPOs.map(po => ({
      'PO #': po.id,
      'Supplier': po.supplier?.name,
      'Date': po.date,
      'Status': po.status,
      'Total': po.total
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'PurchaseOrders');
    XLSX.writeFile(wb, 'PurchaseOrders.xlsx');
  }

  exportPDF() {
    const doc = new jsPDF();
    doc.text('Purchase Orders', 14, 10);
    autoTable(doc, {
      head: [['PO #','Supplier','Date','Status','Total']],
      body: this.filteredPOs.map(po => [
        po.id || '',
        po.supplier?.name || '',
        po.date || '',
        po.status || '',
        po.total ?? 0
      ])
    });
    doc.save('PurchaseOrders.pdf');
  }
}
