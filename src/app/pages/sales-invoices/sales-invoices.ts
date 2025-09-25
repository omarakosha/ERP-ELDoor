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

@Component({
  selector: 'app-sales-invoices',
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
  <h2 class="text-3xl font-bold mb-6">Sales - المبيعات</h2>

  <div class="flex justify-between items-center mb-4">
    <button pButton label="Add Invoice" icon="pi pi-plus" class="p-button-success" (click)="openNewInvoice()"></button>
    <input pInputText type="text" placeholder="Search..." (input)="dt.filterGlobal($event.target.value,'contains')" class="border rounded p-2 w-1/3">
  </div>

  <p-table #dt [value]="invoices" [paginator]="true" [rows]="10" [globalFilterFields]="['customer.name','status']" [responsiveLayout]="'scroll'">
    <ng-template pTemplate="header">
      <tr>
        <th>Invoice #</th>
        <th>Customer</th>
        <th>Date</th>
        <th>Total</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-invoice>
      <tr>
        <td>{{invoice.id}}</td>
        <td>{{invoice.customer?.name}}</td>
        <td>{{invoice.date}}</td>
        <td>{{invoice.total | currency}}</td>
        <td>
          <span [ngClass]="statusClass(invoice.status)">
            {{invoice.status}}
          </span>
        </td>
        <td class="flex gap-2">
  <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-info" (click)="editInvoice(invoice)"></button>
  <button pButton icon="pi pi-trash" class="p-button-rounded p-button-danger" (click)="confirmDelete(invoice)"></button>
  <button pButton icon="pi pi-print" class="p-button-rounded p-button-warning" (click)="printInvoice(invoice)" pTooltip="Print this invoice"></button>
</td>

      </tr>
    </ng-template>
  </p-table>

  <!-- Dialog -->
  <p-dialog header="{{isEdit ? 'Edit' : 'New'}} Invoice" [(visible)]="displayDialog" [modal]="true" [style]="{width:'60vw'}" [closable]="false">
    <div class="grid gap-4">
      <div class="col-6">
        <label class="font-semibold">Customer</label>
        <select [(ngModel)]="newInvoice.customer" class="p-inputtext w-full border rounded p-2">
          <option [ngValue]="null" disabled>Select a customer</option>
          <option *ngFor="let customer of customers" [ngValue]="customer">{{customer.name}}</option>
        </select>
      </div>
      <div class="col-6">
        <label class="font-semibold">Date</label>
        <input type="date" [(ngModel)]="newInvoice.date" class="p-inputtext w-full border rounded p-2"/>
      </div>
    </div>

    <div class="my-4">
      <button pButton label="Add Item" icon="pi pi-plus" class="p-button-secondary mb-2" (click)="addItem()"></button>
      <p-table [value]="newInvoice.items" class="mb-3">
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
            <td>{{item.quantity * item.price | currency}}</td>
            <td>
              <button pButton icon="pi pi-times" class="p-button-rounded p-button-danger" (click)="removeItem(i)"></button>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <div class="text-right font-bold text-lg mb-2">
      Total: {{newInvoice.total | currency}}
    </div>

    <ng-template pTemplate="footer">
      <button pButton label="Cancel" icon="pi pi-times" (click)="displayDialog=false" class="p-button-secondary"></button>
      <button pButton label="Save" icon="pi pi-check" (click)="saveInvoice()" class="p-button-success"></button>
    </ng-template>
  </p-dialog>

  <p-confirmDialog></p-confirmDialog>
</div>
  `
})
export class SalesInvoicesComponent {
  invoices: any[] = [];
  customers: any[] = [];
  products: any[] = [];
  newInvoice: any = { customer: null, items: [], total: 0, date: '' };
  displayDialog = false;
  isEdit = false;

  constructor(private confirmationService: ConfirmationService, private messageService: MessageService){
    this.customers = [
      { id: 1, name: 'Customer A' },
      { id: 2, name: 'Customer B' },
      { id: 3, name: 'Customer C' }
    ];
    this.products = [
      { id: 1, name: 'Product 1' },
      { id: 2, name: 'Product 2' },
      { id: 3, name: 'Product 3' }
    ];
    this.invoices = [
      { id: 1, customer: this.customers[0], date: '2025-09-24', total: 100, status: 'Paid', items: [] },
      { id: 2, customer: this.customers[1], date: '2025-09-25', total: 200, status: 'Pending', items: [] }
    ];
  }

  statusClass(status: string) {
    return {
      'text-green-600 font-bold': status==='Paid',
      'text-yellow-600 font-bold': status==='Pending',
      'text-red-600 font-bold': status==='Overdue'
    };
  }

  openNewInvoice() {
    this.newInvoice = { customer: null, items: [], total: 0, date: new Date().toISOString().substring(0,10), status:'Pending' };
    this.isEdit = false;
    this.displayDialog = true;
  }

  editInvoice(invoice: any) {
    this.newInvoice = { ...invoice, items: invoice.items.map((i:any)=>({...i})) };
    this.isEdit = true;
    this.displayDialog = true;
    this.calculateTotal();
  }

  confirmDelete(invoice: any){
    this.confirmationService.confirm({
      message:'Are you sure you want to delete this invoice?',
      header:'Confirm Delete',
      icon:'pi pi-exclamation-triangle',
      accept: ()=>{
        this.deleteInvoice(invoice);
        this.messageService.add({severity:'success', summary:'Deleted', detail:`Invoice #${invoice.id} deleted successfully.`});
      }
    });
  }

  deleteInvoice(invoice: any){
    this.invoices = this.invoices.filter(i=>i.id!==invoice.id);
  }

  addItem(){
    this.newInvoice.items.push({ product:this.products[0], quantity:1, price:0 });
    this.calculateTotal();
  }

  removeItem(index:number){
    this.newInvoice.items.splice(index,1);
    this.calculateTotal();
  }

  calculateTotal(){
    this.newInvoice.total = this.newInvoice.items.reduce((sum:any,item:any)=>sum+(item.quantity*item.price),0);
  }

  saveInvoice(){
    if(!this.newInvoice.customer){
      this.messageService.add({severity:'warn', summary:'Validation', detail:'Please select a customer!'});
      return;
    }
    this.calculateTotal();
    if(!this.isEdit){
      this.newInvoice.id = this.invoices.length ? Math.max(...this.invoices.map(i=>i.id))+1 : 1;
      this.invoices.push({...this.newInvoice});
      this.messageService.add({severity:'success', summary:'Saved', detail:`Invoice #${this.newInvoice.id} added successfully.`});
    } else {
      const idx = this.invoices.findIndex(i=>i.id===this.newInvoice.id);
      if(idx!==-1) this.invoices[idx] = {...this.newInvoice};
      this.messageService.add({severity:'success', summary:'Updated', detail:`Invoice #${this.newInvoice.id} updated successfully.`});
    }
    this.displayDialog=false;
  }
  printInvoice(invoice: any) {
  if (!confirm(`Are you sure you want to print Invoice #${invoice.id}?`)) {
    return; // إذا رفض المستخدم، لا تطبع
  }

  const printContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="text-align:center;">Invoice #${invoice.id}</h2>
      <p><strong>Customer:</strong> ${invoice.customer?.name}</p>
      <p><strong>Date:</strong> ${invoice.date}</p>
      <table border="1" cellspacing="0" cellpadding="5" width="100%">
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map((item:any) => `
            <tr>
              <td>${item.product?.name}</td>
              <td>${item.quantity}</td>
              <td>${item.price}</td>
              <td>${item.quantity * item.price}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <h3 style="text-align:right;">Total: ${invoice.total}</h3>
      <p style="text-align:center; margin-top:20px;">Thank you for your business!</p>
    </div>
  `;
  
  const newWin = window.open('', '_blank', 'width=800,height=600');
  newWin!.document.write(printContent);
  newWin!.document.close();
  newWin!.print();
}

}
