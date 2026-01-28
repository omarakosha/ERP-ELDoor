import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Table } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TranslateModule } from '@ngx-translate/core';
import { LayoutService } from '@/layout/service/layout.service';
import { debounceTime, fromEvent } from 'rxjs';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  paid: number;
  balance: number;
  status: string;
  activity: number;
}

@Component({
  selector: 'app-crm',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    ToastModule,
    TagModule,
    ProgressBarModule,
    TranslateModule,
  ],
  providers: [ConfirmationService, MessageService],
  template: `
<div class="card" style=" min-height: 77vh">

  <p-toast position="top-center" class="custom-toast"></p-toast>

  <div class="flex flex-wrap justify-between items-center mb-5 gap-3">

    <div class="flex flex-wrap gap-2">
      <button pButton label="Clear Filters" icon="pi pi-filter-slash" class="p-button-outlined" (click)="clear(dt)"outlined></button>
      <button pButton label="Add Customer" icon="pi pi-plus" class="p-button-success" (click)="openNew()"outlined></button>
      <button pButton label="Export Excel" icon="pi pi-file-excel" class="p-button-success" (click)="exportExcel()"outlined></button>
      <button pButton label="Export PDF" icon="pi pi-file-pdf" class="p-button-danger" (click)="exportPDF()"outlined></button>
      <span class="relative">
       
        <input
          #filterInput
          pInputText
          type="text"
          placeholder="Search..."
          class="pl-10 pr-8 py-2 rounded-lg border border-gray-300 focus:border-primary w-64"
        />
      </span>
    </div>
  </div>

  <!-- Customers Table -->
  <p-table
    #dt
    [value]="customers"
    dataKey="id"
    [rows]="10"
    [paginator]="true"
    [rowsPerPageOptions]="[10,20,50]"
    [loading]="loading"
    [globalFilterFields]="['id','name','email','phone','paid','balance']"
    responsiveLayout="scroll"
    class="rounded-xl overflow-hidden shadow-sm"
  >
    <ng-template pTemplate="header">
      <tr class="bg-gray-100 text-gray-700 text-sm">
        <th *ngFor="let col of customerColumns" [style.min-width]="col.minWidth">
          <div class="flex justify-between items-center flex-nowrap min-w-0">
            <span class="truncate font-semibold" [title]="col.header">{{ col.header }}</span>
            <p-columnFilter
              [type]="col.filterType"
              [field]="col.field"
              display="menu"
              [placeholder]="col.filterPlaceholder"
            ></p-columnFilter>
          </div>
        </th>
        <th style="min-width: 120px;">Actions</th>
      </tr>
    </ng-template>

    <ng-template pTemplate="body" let-c>
      <tr class="hover:bg-gray-50">
        <td>{{ c.id }}</td>
        <td class="truncate max-w-[220px]" [title]="c.name">{{ c.name }}</td>
        <td class="truncate max-w-[180px]" [title]="c.email">{{ c.email }}</td>
        <td>{{ c.phone }}</td>
       
          <td>
      <div class="amount-cell">
        <img [src]="getRiyalIcon()" class="riyal-icon" alt="ريال سعودي"/>
        <span class="amount-value">{{c.paid | number:'1.2-2'}}</span>
      </div>
    </td>

      <td>
      <div class="amount-cell">
        <img [src]="getRiyalIcon()" class="riyal-icon" alt="ريال سعودي"/>
        <span class="amount-value">{{c.balance | number:'1.2-2'}}</span>
      </div>
    </td>

     <td><p-tag [value]="c.status" [severity]="getSeverity(c.status)"></p-tag></td>


        
        <td class="flex gap-2 justify-center">
          <button pButton icon="pi pi-pencil" class="p-button-info " (click)="editCustomer(c)"outlined></button>
          <button pButton icon="pi pi-trash" class="p-button-danger " (click)="deleteCustomer(c)"outlined></button>
        </td>
      </tr>
    </ng-template>

    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="8" class="text-center py-4 text-gray-500">
          No results — try adjusting your search or filters.
        </td>
      </tr>
    </ng-template>
  </p-table>

  <!-- Add / Edit Dialog -->
  <p-dialog
    [header]="isEdit ? ('CUSTOMER.EDIT' | translate) : ('CUSTOMER.ADD' | translate)"
    [(visible)]="displayDialog"
    [modal]="true"
    [closable]="true"
    [style]="{ width: '95vw', maxWidth: '450px' }"
    
  >
    <div class="p-fluid space-y-4">
      <div class="field">
        <label class="font-semibold mb-1 block">Customer ID</label>
        <input pInputText type="number" [(ngModel)]="newCustomer.id" class="w-full" />
      </div>
      <div class="field">
        <label class="font-semibold mb-1 block">Customer Name</label>
        <input pInputText [(ngModel)]="newCustomer.name" class="w-full" />
      </div>
      <div class="field">
        <label class="font-semibold mb-1 block">Email</label>
        <input pInputText [(ngModel)]="newCustomer.email" class="w-full" />
      </div>
      <div class="field">
        <label class="font-semibold mb-1 block">Phone</label>
        <input pInputText [(ngModel)]="newCustomer.phone" class="w-full" />
      </div>
      <div class="field grid grid-cols-2 gap-2">
        <div>
          <label class="font-semibold mb-1 block">Paid</label>
          <input pInputText type="number" [(ngModel)]="newCustomer.paid" class="w-full" />
        </div>
        <div>
          <label class="font-semibold mb-1 block">Balance</label>
          <input pInputText type="number" [(ngModel)]="newCustomer.balance" class="w-full" />
        </div>
      </div>
      <div class="field">
        <label class="font-semibold mb-1 block">Status</label>
        <input pInputText [(ngModel)]="newCustomer.status" class="w-full" />
      </div>

      <div class="flex justify-end gap-2 pt-4 border-t">
        <button pButton label="Cancel" icon="pi pi-times-circle" class="p-button-danger" (click)="displayDialog = false"outlined></button>
        <button pButton label="Save" icon="pi pi-save" class="p-button-success" (click)="saveCustomer()"outlined></button>
      </div>
    </div>
  </p-dialog>

</div>
  `
})
export class CRMComponent implements OnInit {

  @ViewChild('filterInput') filterInput!: ElementRef;
  @ViewChild('dt') dt!: Table; // أضف هذا فوق المتغيرات

  customers: Customer[] = [];
  displayDialog = false;
  isEdit = false;
  loading = true;
  newCustomer: Customer = { id: 0, name: '', email: '', phone: '', paid: 0, balance: 0, status: 'جديد', activity: 0 };

  customerColumns = [
    { field: 'id', header: 'رمز العميل', filterType: 'text', filterPlaceholder: 'بحث...', minWidth: '100px' },
    { field: 'name', header: 'اسم العميل', filterType: 'text', filterPlaceholder: 'بحث...', minWidth: '160px' },
    { field: 'email', header: 'البريد الإلكتروني', filterType: 'text', filterPlaceholder: 'بحث...', minWidth: '180px' },
    { field: 'phone', header: 'الهاتف', filterType: 'text', filterPlaceholder: 'بحث...', minWidth: '140px' },
    { field: 'paid', header: 'المدفوع', filterType: 'numeric', filterPlaceholder: 'بحث...', minWidth: '120px' },
    { field: 'balance', header: 'المستحق', filterType: 'numeric', filterPlaceholder: 'بحث...', minWidth: '120px' },
    { field: 'status', header: 'الحالة', filterType: 'text', filterPlaceholder: 'بحث...', minWidth: '100px' }
  ];

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private layoutService: LayoutService
  ) { }

  ngOnInit() {
    this.customers = [
      { id: 6329206, name: 'ليلى بنت عبد العالى بن عامر البنوى السلمي', email: 'laila@example.com', phone: '0540249700', paid: 17500, balance: 0, status: 'نشط', activity: 80 }
    ];
    this.loading = false;
  }

  getRiyalIcon() {
    return this.layoutService.isDarkTheme()
      ? 'assets/icons/riyalsymbol-dark.png'  // أيقونة الداكن
      : 'assets/icons/riyalsymbol.png'; // أيقونة الفاتح
  }

  
  getSeverity(status: string) {
    switch (status.toLowerCase()) {
      case 'نشط': return 'success';
      case ' النقل': return 'warn';
      case 'غير نشط': return 'danger';
      default: return 'info';
    }
  }


  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clear(table: Table) {
    table.clear();
    this.filterInput.nativeElement.value = '';
  }

  openNew() {
    this.newCustomer = { id: 0, name: '', email: '', phone: '', paid: 0, balance: 0, status: 'جديد', activity: 0 };
    this.isEdit = false;
    this.displayDialog = true;
  }

  editCustomer(customer: Customer) {
    this.newCustomer = { ...customer };
    this.isEdit = true;
    this.displayDialog = true;
  }

  saveCustomer() {
    if (!this.newCustomer.name || !this.newCustomer.email) {
      this.messageService.clear();
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'يرجى تعبئة جميع الحقول المطلوبة', life: 3000 });
      return;
    }

    if (!this.isEdit) {
      this.customers.push({ ...this.newCustomer });
      this.messageService.clear();
      this.messageService.add({ severity: 'success', summary: 'Saved', detail: `Customer "${this.newCustomer.name}" added successfully`, life: 3000 });
    } else {
      const index = this.customers.findIndex(c => c.id === this.newCustomer.id);
      if (index !== -1) this.customers[index] = { ...this.newCustomer };
      this.messageService.clear();
      this.messageService.add({ severity: 'success', summary: 'Updated', detail: `Customer "${this.newCustomer.name}" updated successfully`, life: 3000 });
    }

    this.displayDialog = false;
  }

  deleteCustomer(customer: Customer) {
    this.confirmationService.confirm({
      message: `هل تريد حذف العميل "${customer.name}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.customers = this.customers.filter(c => c.id !== customer.id);
        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `Customer "${customer.name}" deleted.`, life: 3000 });
      }
    });
  }

  exportExcel() {
    const ws = XLSX.utils.json_to_sheet(this.customers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Customers');
    XLSX.writeFile(wb, 'Customers.xlsx');
  }

  exportPDF() {
    const doc = new jsPDF();
    doc.text('قائمة العملاء', 14, 10);
    autoTable(doc, {
      head: [['رمز العميل', 'اسم العميل', 'البريد الإلكتروني', 'الهاتف', 'المدفوع', 'المستحق', 'الحالة']],
      body: this.customers.map(c => [c.id, c.name, c.email, c.phone, c.paid, c.balance, c.status])
    });
    doc.save('Customers.pdf');
  }

}
