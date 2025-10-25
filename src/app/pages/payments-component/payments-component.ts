import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Table } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Payment {
  receiptNo: string;
  date: Date;
  customer: string;
  amount: number;
  paymentMethod: string;
  cashBox: string;
}

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    ToastModule
  ],
  template: `
<div class="card">
    <div class="font-semibold text-xl mb-4">مدفوعات العملاء</div>

    <!-- Toolbar -->
    <div class="flex flex-wrap gap-2 mb-3">
        <button pButton label="Clear Filters" class="p-button-outlined" icon="pi pi-filter-slash" (click)="clear(dt)"></button>
        <button pButton label="Export Excel" icon="pi pi-file-excel" class="p-button-success" (click)="exportExcel()"></button>
        <button pButton label="Export PDF" icon="pi pi-file-pdf" class="p-button-danger" (click)="exportPDF()"></button>
        <input pInputText #filterInput placeholder="بحث عام..." (input)="onGlobalFilter(dt, $event)" class="ml-auto">
    </div>

    <!-- Payments Table -->
    <p-table
        #dt
        [value]="payments"
        dataKey="receiptNo"
        [rows]="10"
        [rowHover]="true"
        [paginator]="true"
        [loading]="loading"
        [globalFilterFields]="['receiptNo','customer','paymentMethod','cashBox']"
        responsiveLayout="scroll"
    >
        <ng-template #header>
            <tr>
                <th>
                    رقم سند القبض
                    <p-columnFilter type="text" field="receiptNo" display="menu" placeholder="بحث برقم السند"></p-columnFilter>
                </th>
                <th>
                    تاريخ الاستلام
                    <p-columnFilter type="date" field="date" display="menu" placeholder="بحث بالتاريخ"></p-columnFilter>
                </th>
                <th>
                    اسم العميل
                    <p-columnFilter type="text" field="customer" display="menu" placeholder="بحث باسم العميل"></p-columnFilter>
                </th>
                <th>
                    المبلغ
                    <p-columnFilter type="numeric" field="amount" display="menu" placeholder="بحث بالمبلغ"></p-columnFilter>
                </th>
                <th>
                    طريقة الدفع
                    <p-columnFilter type="text" field="paymentMethod" display="menu" placeholder="بحث بطريقة الدفع"></p-columnFilter>
                </th>
                <th>
                    اسم الصندوق
                    <p-columnFilter type="text" field="cashBox" display="menu" placeholder="بحث باسم الصندوق"></p-columnFilter>
                </th>
                <th>الإجراءات</th>
            </tr>
        </ng-template>

        <ng-template #body let-p>
            <tr>
                <td>{{p.receiptNo}}</td>
                <td>{{p.date | date:'MM/dd/yyyy'}}</td>
                <td>{{p.customer}}</td>
                <td>{{p.amount | currency:'USD'}}</td>
                <td>{{p.paymentMethod}}</td>
                <td>{{p.cashBox}}</td>
                <td>
                    <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-info" (click)="editPayment(p)"></button>
                </td>
            </tr>
        </ng-template>

        <ng-template #emptymessage>
            <tr>
                <td colspan="7">لا توجد نتائج. برجاء تعديل بحثك أو خيارات التصفية للعثور على ما تبحث عنه.</td>
            </tr>
        </ng-template>
    </p-table>

    <!-- Add/Edit Payment Dialog -->
    <p-dialog header="{{isEdit ? 'تعديل الدفعة' : 'إضافة دفعة'}}" [(visible)]="displayDialog" [modal]="true" [closable]="false" [style]="{width: '450px'}">
        <div class="grid gap-3">
            <div>
                <label>رقم سند القبض</label>
                <input pInputText [(ngModel)]="newPayment.receiptNo" class="w-full">
            </div>
            <div>
                <label>تاريخ الاستلام</label>
                <input pInputText type="date" [(ngModel)]="newPayment.date" class="w-full">
            </div>
            <div>
                <label>اسم العميل</label>
                <input pInputText [(ngModel)]="newPayment.customer" class="w-full">
            </div>
            <div>
                <label>المبلغ</label>
                <input pInputText type="number" [(ngModel)]="newPayment.amount" class="w-full">
            </div>
            <div>
                <label>طريقة الدفع</label>
                <input pInputText [(ngModel)]="newPayment.paymentMethod" class="w-full">
            </div>
            <div>
                <label>اسم الصندوق</label>
                <input pInputText [(ngModel)]="newPayment.cashBox" class="w-full">
            </div>
        </div>
        <ng-template pTemplate="footer">
            <button pButton label="Cancel" icon="pi pi-times" (click)="displayDialog=false" class="p-button-secondary"></button>
            <button pButton label="Save" icon="pi pi-check" (click)="savePayment()" class="p-button-success"></button>
        </ng-template>
    </p-dialog>
</div>
  `
})
export class PaymentsComponent implements OnInit {
  @ViewChild('filterInput') filterInput!: ElementRef;

  payments: Payment[] = [];
  displayDialog = false;
  isEdit = false;
  newPayment: Payment = {receiptNo:'', date:new Date(), customer:'', amount:0, paymentMethod:'', cashBox:''};
  loading = true;

  ngOnInit() {
    this.payments = [
      {receiptNo:'RCPT-1001', date:new Date(), customer:'أحمد علي', amount:5000, paymentMethod:'نقدي', cashBox:'صندوق رئيسي'}
    ];
    this.loading = false;
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clear(table: Table) {
    table.clear();
    this.filterInput.nativeElement.value = '';
  }

  openNew() {
    this.newPayment = {receiptNo:'', date:new Date(), customer:'', amount:0, paymentMethod:'', cashBox:''};
    this.isEdit = false;
    this.displayDialog = true;
  }

  editPayment(payment: Payment) {
    this.newPayment = {...payment};
    this.isEdit = true;
    this.displayDialog = true;
  }

  savePayment() {
    if(!this.isEdit){
      this.payments.push({...this.newPayment});
    } else {
      const idx = this.payments.findIndex(p => p.receiptNo === this.newPayment.receiptNo);
      if(idx!==-1) this.payments[idx] = {...this.newPayment};
    }
    this.displayDialog = false;
  }

  exportExcel() {
    const ws = XLSX.utils.json_to_sheet(this.payments);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payments');
    XLSX.writeFile(wb, 'Payments.xlsx');
  }

  exportPDF() {
    const doc = new jsPDF();
    doc.text('مدفوعات العملاء', 14, 10);
    autoTable(doc, {
      head:[['رقم سند القبض','تاريخ الاستلام','اسم العميل','المبلغ','طريقة الدفع','اسم الصندوق']],
      body: this.payments.map(p => [p.receiptNo,p.date.toLocaleDateString(),p.customer,p.amount,p.paymentMethod,p.cashBox])
    });
    doc.save('Payments.pdf');
  }
}
