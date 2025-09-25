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

interface Supplier { id:number; name:string; }
interface Product { id:number; name:string; }
interface POItem { product: Product|null; quantity: number; price: number; }
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
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    ConfirmDialogModule,
    InputTextModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
    template: `
<div class="p-6 bg-white shadow-lg rounded-lg">
  <p-toast></p-toast>
  <h2 class="text-3xl font-bold mb-6">Purchases - المشتريات</h2>

  <div class="flex justify-between items-center mb-4">
    <button pButton label="Add Purchase Order" icon="pi pi-plus" class="p-button-success" (click)="openNewPO()"></button>
    <input pInputText type="text" placeholder="Search..." (input)="applyFilter($event)" class="border rounded p-2 w-1/3">
  </div>

  <p-table [value]="filteredPOs" [paginator]="true" [rows]="10" [responsiveLayout]="'scroll'">
    <ng-template pTemplate="header">
      <tr>
        <th>PO #</th>
        <th>Supplier</th>
        <th>Date</th>
        <th>Total</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-po>
      <tr>
        <td>{{po.id}}</td>
        <td>{{po.supplier?.name}}</td>
        <td>{{po.date}}</td>
        <td>{{po.total | currency:'SAR'}}</td>
        <td><span [ngClass]="statusClass(po.status)">{{po.status}}</span></td>
        <td class="flex gap-2">
          <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-info" (click)="editPO(po)"></button>
          <button pButton icon="pi pi-trash" class="p-button-rounded p-button-danger" (click)="confirmDelete(po)"></button>
          <button pButton icon="pi pi-print" class="p-button-rounded p-button-warning" (click)="printPO(po)"></button>
        </td>
      </tr>
    </ng-template>
  </p-table>

  <!-- Dialog لإضافة/تعديل PO -->
  <p-dialog header="{{isEdit ? 'Edit' : 'New'}} Purchase Order" [(visible)]="displayDialog" [modal]="true" [style]="{width:'60vw'}" [closable]="false">
    <div class="grid gap-4">
      <div class="col-6">
        <label class="font-semibold">Supplier</label>
        <select [(ngModel)]="newPO.supplier" class="p-inputtext w-full border rounded p-2">
          <option [ngValue]="null" disabled>Select a supplier</option>
          <option *ngFor="let supplier of suppliers" [ngValue]="supplier">{{supplier.name}}</option>
        </select>
      </div>
      <div class="col-6">
        <label class="font-semibold">Date</label>
        <input type="date" [(ngModel)]="newPO.date" class="p-inputtext w-full border rounded p-2"/>
      </div>
    </div>

    <div class="my-4">
      <button pButton label="Add Item" icon="pi pi-plus" class="p-button-secondary mb-2" (click)="addItem()"></button>
      <p-table [value]="newPO.items" class="mb-3">
        <ng-template pTemplate="header">
          <tr>
            <th style="width: 25%">Product</th>
            <th style="width: 15%">Qty</th>
            <th style="width: 20%">Price</th>
            <th style="width: 20%">Total</th>
            <th style="width: 20%">Action</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-item let-i="rowIndex">
          <tr>
            <td>
              <select [(ngModel)]="item.product" class="p-inputtext w-full border rounded p-1">
                <option [ngValue]="null" disabled>Select product</option>
                <option *ngFor="let product of products" [ngValue]="product">{{product.name}}</option>
              </select>
            </td>
            <td><input type="number" min="1" [(ngModel)]="item.quantity" (input)="calculateTotal()" class="p-inputtext w-full border rounded p-1"></td>
            <td><input type="number" min="0" [(ngModel)]="item.price" (input)="calculateTotal()" class="p-inputtext w-full border rounded p-1"></td>
            <td>{{item.quantity * item.price | currency:'SAR'}}</td>
            <td>
              <button pButton icon="pi pi-times" class="p-button-rounded p-button-danger" (click)="removeItem(i)"></button>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <div class="text-right font-bold text-lg mb-2">Total: {{newPO.total | currency:'SAR'}}</div>

    <ng-template pTemplate="footer">
      <button pButton label="Cancel" icon="pi pi-times" (click)="displayDialog=false" class="p-button-secondary"></button>
      <button pButton label="Save" icon="pi pi-check" (click)="savePO()" class="p-button-success"></button>
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
  filterText = '';

  constructor(private confirmationService: ConfirmationService, private messageService: MessageService) {
    // بيانات تجريبية
    this.suppliers = [
      { id: 1, name: 'Supplier A' },
      { id: 2, name: 'Supplier B' },
      { id: 3, name: 'Supplier C' }
    ];
    this.products = [
      { id: 1, name: 'Product 1' },
      { id: 2, name: 'Product 2' },
      { id: 3, name: 'Product 3' }
    ];
    this.purchaseOrders = [
      { id:'PO-001', supplier:this.suppliers[0], date:'2025-09-24', status:'New', items:[], total:1200 },
      { id:'PO-002', supplier:this.suppliers[1], date:'2025-09-25', status:'Approved', items:[], total:850 },
      { id:'PO-003', supplier:this.suppliers[2], date:'2025-09-26', status:'Received', items:[], total:430 }
    ];
  }

  // تعيين ألوان الحالة
  statusClass(status: string) {
    return {
      'text-blue-600 font-bold': status==='New',
      'text-green-600 font-bold': status==='Approved',
      'text-orange-600 font-bold': status==='Received'
    };
  }

  // فتح Dialog لإضافة PO جديد
  openNewPO() {
    this.newPO = { id:'', supplier:null, items:[], total:0, date: new Date().toISOString().substring(0,10), status:'New' };
    this.isEdit = false;
    this.displayDialog = true;
  }

  // فتح Dialog لتعديل PO
  editPO(po: PurchaseOrder) {
    this.newPO = { ...po, items: po.items.map(i=>({...i})) };
    this.isEdit = true;
    this.displayDialog = true;
    this.calculateTotal();
  }

  // حذف PO مع تأكيد
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
    this.messageService.add({severity:'success', summary:'Deleted', detail:`PO #${po.id} deleted successfully.`});
  }

  // إضافة عنصر جديد
  addItem() {
    this.newPO.items.push({ product:this.products[0], quantity:1, price:0 });
    this.calculateTotal();
  }

  // إزالة عنصر
  removeItem(index:number) {
    this.newPO.items.splice(index,1);
    this.calculateTotal();
  }

  // حساب الإجمالي
  calculateTotal() {
    this.newPO.total = this.newPO.items.reduce((sum,item) => sum + (item.quantity*item.price),0);
  }

  // حفظ PO
  savePO() {
    if(!this.newPO.supplier){
      this.messageService.add({severity:'warn', summary:'Validation', detail:'Please select a supplier!'});
      return;
    }
    this.calculateTotal();
    if(!this.isEdit){
      this.newPO.id = 'PO-' + (this.purchaseOrders.length+1).toString().padStart(3,'0');
      this.purchaseOrders.push({...this.newPO});
      this.messageService.add({severity:'success', summary:'Saved', detail:`PO #${this.newPO.id} added successfully.`});
    } else {
      const idx = this.purchaseOrders.findIndex(p=>p.id===this.newPO.id);
      if(idx!==-1) this.purchaseOrders[idx] = {...this.newPO};
      this.messageService.add({severity:'success', summary:'Updated', detail:`PO #${this.newPO.id} updated successfully.`});
    }
    this.displayDialog = false;
  }

  // طباعة PO
  printPO(po: PurchaseOrder) {
    if (!confirm(`Are you sure you want to print PO #${po.id}?`)) return;
    const content = `
      <div style="font-family:Arial,sans-serif;padding:20px;">
        <h2 style="text-align:center;">Purchase Order #${po.id}</h2>
        <p><strong>Supplier:</strong> ${po.supplier?.name}</p>
        <p><strong>Date:</strong> ${po.date}</p>
        <table border="1" cellspacing="0" cellpadding="5" width="100%">
          <thead>
            <tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>
          </thead>
          <tbody>
            ${po.items.map(i=>`
              <tr>
                <td>${i.product?.name}</td>
                <td>${i.quantity}</td>
                <td>${i.price}</td>
                <td>${i.quantity*i.price}</td>
              </tr>`).join('')}
          </tbody>
        </table>
        <h3 style="text-align:right;">Total: ${po.total}</h3>
        <p style="text-align:center;margin-top:20px;">Thank you!</p>
      </div>
    `;
    const win = window.open('','_blank','width=800,height=600');
    win!.document.write(content);
    win!.document.close();
    win!.print();
  }

  // فلترة البحث
  applyFilter(event: Event) {
    const val = (event.target as HTMLInputElement).value.toLowerCase();
    this.filterText = val;
  }

  get filteredPOs() {
    if(!this.filterText) return this.purchaseOrders;
    return this.purchaseOrders.filter(po =>
      po.supplier?.name.toLowerCase().includes(this.filterText) ||
      po.status.toLowerCase().includes(this.filterText)
    );
  }
}
