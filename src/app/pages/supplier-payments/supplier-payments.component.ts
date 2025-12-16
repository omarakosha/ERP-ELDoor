import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';

interface SupplierPayment {
  invoiceNumber: string;
  creationDate: string;
  supplier: string;
  paymentCategory: string;
  status: string;
  paymentMethod: string;
  totalPaid: number;
}

@Component({
  selector: 'app-supplier-payments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    DialogModule,
    TagModule
  ],
  template: `
<div class="card p-4">

  <h2 class="text-xl font-semibold mb-4">Supplier Payments</h2>

  <!-- Global Search -->
  <div class="mb-4">
    <input pInputText placeholder="Global Search..." [(ngModel)]="globalFilter" 
           (input)="dt.filterGlobal(globalFilter, 'contains')" class="w-full md:w-1/3">
  </div>

  <!-- Payments Table -->
  <p-table #dt [value]="payments" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[10,20,50]"
           [showGridlines]="true" responsiveLayout="scroll"
           [globalFilterFields]="['invoiceNumber','creationDate','supplier','paymentCategory','status','paymentMethod']">

    <ng-template pTemplate="header">
      <tr>
        <th>
          <span>Invoice Number</span>
          <p-columnFilter type="text" field="invoiceNumber" display="menu" placeholder="Search"></p-columnFilter>
        </th>
        <th>
          <span>Creation Date</span>
          <p-columnFilter type="date" field="creationDate" display="menu"></p-columnFilter>
        </th>
        <th>
          <span>Supplier</span>
          <p-columnFilter type="text" field="supplier" display="menu" placeholder="Search"></p-columnFilter>
        </th>
        <th>
          <span>Payment Category</span>
          <p-columnFilter type="text" field="paymentCategory" display="menu" placeholder="Search"></p-columnFilter>
        </th>
        <th>
          <span>Status</span>
          <p-columnFilter type="text" field="status" display="menu" placeholder="Search"></p-columnFilter>
        </th>
        <th>
          <span>Payment Method</span>
          <p-columnFilter type="text" field="paymentMethod" display="menu" placeholder="Search"></p-columnFilter>
        </th>
        <th>Total Paid</th>
        <th>Actions</th>
      </tr>
    </ng-template>

    <ng-template pTemplate="body" let-p>
      <tr>
        <td>{{p.invoiceNumber}}</td>
        <td>{{p.creationDate}}</td>
        <td>{{p.supplier}}</td>
        <td>{{p.paymentCategory}}</td>
        <td>{{p.status}}</td>
        <td>{{p.paymentMethod}}</td>
        <td>{{p.totalPaid | number:'1.2-2'}}</td>
        <td class="flex gap-2">
          <button pButton icon="pi pi-eye" class="p-button-sm p-button-info" (click)="viewPayment(p)"outlined></button>
          <button pButton icon="pi pi-trash" class="p-button-sm p-button-danger" (click)="deletePayment(p)"outlined></button>
        </td>
      </tr>
    </ng-template>

    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="8" class="text-center text-gray-500 p-4">
          No data available
        </td>
      </tr>
    </ng-template>
  </p-table>

</div>

<p-dialog header="Payment Details" [(visible)]="displayDialog" [modal]="true" [style]="{width:'400px'}">
  <div *ngIf="selectedPayment">
    <p><strong>Invoice Number:</strong> {{selectedPayment.invoiceNumber}}</p>
    <p><strong>Creation Date:</strong> {{selectedPayment.creationDate}}</p>
    <p><strong>Supplier:</strong> {{selectedPayment.supplier}}</p>
    <p><strong>Payment Category:</strong> {{selectedPayment.paymentCategory}}</p>
    <p><strong>Status:</strong> {{selectedPayment.status}}</p>
    <p><strong>Payment Method:</strong> {{selectedPayment.paymentMethod}}</p>
    <p><strong>Total Paid:</strong> {{selectedPayment.totalPaid | number:'1.2-2'}}</p>
  </div>
  <ng-template pTemplate="footer">
    <button pButton label="Close" (click)="displayDialog=false"outlined></button>
  </ng-template>
</p-dialog>

  `
})
export class SupplierPaymentsComponent {
  payments: SupplierPayment[] = [
    { invoiceNumber: 'INV001', creationDate: '2025-10-20', supplier: 'شركة السريع', paymentCategory: 'دفعة نقدية', status: 'مدفوع', paymentMethod: 'نقداً', totalPaid: 1500 },
    { invoiceNumber: 'INV002', creationDate: '2025-10-21', supplier: 'مؤسسة النور', paymentCategory: 'شيك', status: 'قيد الانتظار', paymentMethod: 'شيك مصرفي', totalPaid: 3000 }
  ];

  displayDialog = false;
  selectedPayment?: SupplierPayment;
  globalFilter: string = '';

  viewPayment(p: SupplierPayment) {
    this.selectedPayment = p;
    this.displayDialog = true;
  }

  deletePayment(p: SupplierPayment) {
    this.payments = this.payments.filter(x => x !== p);
  }
}
