import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';
import { ContextMenuModule } from 'primeng/contextmenu';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-journal-entries',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    DatePickerModule,
    ContextMenuModule,
    MultiSelectModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
 <div class="p-6 bg-white shadow-lg rounded-lg" dir="ltr">
  <p-toast></p-toast>

  <!-- عنوان الصفحة -->
  <h2 class="text-3xl font-bold mb-6">Journal Entries - قيود اليومية</h2>

  <!-- أزرار البحث والإضافة -->
  <div class="flex flex-wrap items-center gap-4 mb-4">
    <button pButton label="New Entry" icon="pi pi-plus" class="p-button-success"
            (click)="openNewJournal()"></button>

    <div class="flex items-center gap-2">
      <input type="text" pInputText placeholder="Search her...."
             [(ngModel)]="journalIdFilter"
             class="p-inputtext w-40">
    </div>
  </div>

  <!-- جدول القيد -->
  <p-table [value]="journalEntries" [paginator]="true" [rows]="10" [responsiveLayout]="'scroll'">
    <ng-template pTemplate="header">
      <tr>
        <th>#</th>
        <th>Date</th>
        <th>Total Debit</th>
        <th>Total Credit</th>
        <th>Actions</th>
      </tr>
    </ng-template>

    <ng-template pTemplate="body" let-journal let-i="rowIndex">
      <tr *ngIf="matchesJournalFilter(journal)">
        <td>{{journal.id}}</td>
        <td>{{journal.date}}</td>
        <td>{{journal.totalDebit | number:'1.2-2'}}</td>
        <td>{{journal.totalCredit | number:'1.2-2'}}</td>
        <td class="flex gap-2">
          <button pButton icon="pi pi-pencil" class="p-button-info p-button-sm"
                  (click)="editJournal(journal)"></button>
          <button pButton icon="pi pi-trash" class="p-button-danger p-button-sm"
                  (click)="deleteJournal(i)"></button>
          <button pButton icon="pi pi-print" class="p-button-warning p-button-sm"
                  (click)="printEntry(journal)"></button>
        </td>
      </tr>
    </ng-template>
  </p-table>

  <!-- Dialog إضافة/تعديل القيد -->
  <p-dialog header="{{isEdit ? 'Edit Entry' : 'New Entry'}}"
            [(visible)]="displayDialog" [modal]="true"
            [style]="{width:'90vw'}" [closable]="false">

    <!-- رقم القيد والتاريخ -->
    <div class="grid gap-4 mb-4">
      <div class="col-6">
        <label class="block mb-1 font-semibold">Entry No.</label>
        <input type="text" [(ngModel)]="currentJournal.id"
               class="p-inputtext w-full bg-gray-100" readonly>
      </div>
      <div class="col-6">
        <label class="block mb-1 font-semibold">Date</label>
        <p-datepicker [(ngModel)]="currentJournal.date" [showIcon]="true"></p-datepicker>
      </div>
    </div>

    <!-- جدول الأسطر -->
    <p-table [value]="currentJournal.entries"
             [responsiveLayout]="'scroll'"
             class="mb-4"
             selectionMode="single"
             [(contextMenuSelection)]="selectedLine"
             [contextMenu]="cm">

      <ng-template pTemplate="header">
        <tr>
          <th>#</th>
          <th>Account</th>
          <th>Vendor</th>
          <th>Description</th>
          <th>Debit</th>
          <th>Credit</th>
          <th>Cost Center</th>
          <th>Tags</th>
          <th>Action</th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-line let-i="rowIndex">
        <tr (click)="selectedRowIndex=i">
          <td>{{ i + 1 }}</td>
          <td>
            <input type="text" [(ngModel)]="line.account"
                   (input)="handleAccountInput($event, i)"
                   (keydown)="openAccountSearch($event, i)"
                   [class.p-invalid]="line.invalidAccount"
                   placeholder="Account No. or F9 to Search"
                   class="p-inputtext w-full">
          </td>
          <td>
            <input type="text" [(ngModel)]="line.vendor"
                   (input)="handleVendorInput($event,i)"
                   [class.p-invalid]="line.invalidVendor"
                   (keydown)="openVendorDialog($event,i)"
                   placeholder="Vendor No. or F9 to Search"
                   class="p-inputtext w-full">
          </td>
          <td>
            <input type="text" [(ngModel)]="line.description"
                   class="p-inputtext w-full"
                   placeholder="Description"
                   style="width: 300px;">
          </td>
          <td>
            <input type="text"
                   [(ngModel)]="line.debit"
                   (focus)="formatWithCommas(line, 'debit')"
                   (input)="formatWithCommas(line, 'debit')"
                   class="p-inputtext w-full text-right"
                   placeholder="0.00">
          </td>
          <td>
            <input type="text"
                   [(ngModel)]="line.credit"
                   (focus)="formatWithCommas(line, 'credit')"
                   (input)="formatWithCommas(line, 'credit')"
                   class="p-inputtext w-full text-right"
                   placeholder="0.00">
          </td>
          <td>
            <input type="text" [(ngModel)]="line.costCenter"
                   (input)="handleCostCenterInput($event,i)"
                   (keydown)="openCostCenterSearch($event,i)"
                   [class.p-invalid]="line.invalidCostCenter"
                   placeholder="CostCenter No. or F9 to Search"
                   class="p-inputtext w-full">
          </td>
          <td>
            <p-multiSelect [options]="tags" [(ngModel)]="line.tags"
                           optionLabel="name" display="chip"
                           defaultLabel="Select tags" [filter]="true"></p-multiSelect>
          </td>
          <td>
            <button pButton icon="pi pi-trash" class="p-button p-button-danger p-button-sm"
                    (click)="removeJournalLine(i)"></button>
          </td>
        </tr>
      </ng-template>
    </p-table>

    <p-contextMenu #cm [model]="contextMenuItems"></p-contextMenu>

    <div *ngIf="currentJournal.totalDebit !== currentJournal.totalCredit"
         class="text-red-600 font-bold text-right">
      ⚠️ Debit and Credit must be equal
    </div>

    <div class="mt-2 text-right font-semibold">
      <span *ngFor="let tag of tags">
        {{tag.name}} Total: {{calculateTagTotal(tag.name) | number:'1.2-2'}} &nbsp;
      </span>
    </div>

    <div class="text-right font-bold mt-2">
      Total Debit: {{currentJournal.totalDebit | number:'1.2-2'}} |
      Total Credit: {{currentJournal.totalCredit | number:'1.2-2'}}
    </div>

    <div class="mt-4 text-right flex gap-2 justify-end">
      <button pButton label="Cancel" icon="pi pi-times" class="p-button-secondary"
              (click)="displayDialog=false"></button>
      <button pButton label="Save" icon="pi pi-check" class="p-button-success"
              (click)="saveJournal()"></button>
    </div>
  </p-dialog>

<!-- Dialog الموردين -->
<p-dialog header="Vendors" [(visible)]="vendorDialog" [modal]="true"
          [style]="{'width':'50vw','height':'450px'}" [resizable]="false"
          [breakpoints]="{'960px':'90vw'}">

  <div class="flex gap-2 mb-2">
    <input type="text" pInputText [(ngModel)]="vendorFilter"
           placeholder="Search vendor..." class="flex-1"
           (input)="filteredVendors()">
    <button pButton label="Add Vendor" icon="pi pi-plus"
            class="p-button-success" (click)="openAddVendor()"></button>
  </div>

  <p-table [value]="filteredVendors()" [paginator]="true" [rows]="5"
           [rowsPerPageOptions]="[5,10,15]" [scrollable]="true" [scrollHeight]="'250px'"
           [responsiveLayout]="'scroll'">
    <ng-template pTemplate="header">
      <tr>
        <th>Vendor Name</th>
        <th>Account No</th>
        <th>Actions</th>
      </tr>
    </ng-template>

    <ng-template pTemplate="body" let-vn>
      <tr style="height:50px" (click)="selectVendor(vn)" class="cursor-pointer hover:bg-gray-200">
        <td>{{vn.name}}</td>
        <td>{{vn.account}}</td>
        <td class="flex gap-2">
          <button pButton icon="pi pi-pencil"
                  class="p-button-sm p-button-info"
                  (click)="openEditVendor(vn); $event.stopPropagation()"></button>
        </td>
      </tr>
    </ng-template>
  </p-table>
</p-dialog>

<!-- Dialog الحسابات -->
<p-dialog header="Select Account" [(visible)]="accountDialog" [modal]="true"
          [style]="{'width':'50vw','height':'450px'}" [resizable]="false"
          [breakpoints]="{'960px':'90vw'}">

  <input type="text" pInputText [(ngModel)]="accountFilter"
         placeholder="Search account..." class="w-full mb-2"
         (input)="filteredAccounts()">

  <p-table [value]="filteredAccounts()" [paginator]="true" [rows]="5"
           [rowsPerPageOptions]="[5,10,15]" [scrollable]="true" [scrollHeight]="'250px'"
           [responsiveLayout]="'scroll'">
    <ng-template pTemplate="header">
      <tr>
        <th>Account Name</th>
        <th>Account No</th>
      </tr>
    </ng-template>

    <ng-template pTemplate="body" let-acc>
      <tr style="height:50px" (click)="selectAccount(acc)" class="cursor-pointer hover:bg-gray-200">
        <td>{{acc.name}}</td>
        <td>{{acc.code}}</td>
      </tr>
    </ng-template>
  </p-table>
</p-dialog>

<!-- Dialog مراكز التكلفة -->
<p-dialog header="Select Cost Center" [(visible)]="costCenterDialog" [modal]="true"
          [style]="{'width':'50vw','height':'450px'}" [resizable]="false"
          [breakpoints]="{'960px':'90vw'}">

  <input type="text" pInputText [(ngModel)]="costCenterFilter"
         placeholder="Search cost center..." class="w-full mb-2"
         (input)="filteredCostCenters()">

  <p-table [value]="filteredCostCenters()" [paginator]="true" [rows]="5"
           [rowsPerPageOptions]="[5,10,15]" [scrollable]="true" [scrollHeight]="'250px'"
           [responsiveLayout]="'scroll'">
    <ng-template pTemplate="header">
      <tr>
        <th>Cost Center Name</th>
        <th>Cost Center No</th>
      </tr>
    </ng-template>

    <ng-template pTemplate="body" let-cc>
      <tr style="height:50px" (click)="selectCostCenter(cc)" class="cursor-pointer hover:bg-gray-200">
        <td>{{cc.name}}</td>
        <td>{{cc.code}}</td>
      </tr>
    </ng-template>
  </p-table>
</p-dialog>

  <!-- Dialog إضافة / تعديل مورد -->
  <p-dialog header="{{isEditVendor ? 'Edit Vendor' : 'Add Vendor'}}"
            [(visible)]="vendorFormDialog" [modal]="true" [style]="{width:'40vw'}"
            [resizable]="true" [breakpoints]="{'960px':'90vw'}">
    <label class="block mb-1 font-semibold">Vendor Name</label>
    <input type="text" pInputText [(ngModel)]="currentVendor.name" class="w-full mb-2">

    <label class="block mb-1 font-semibold">Account No</label>
    <input type="text" pInputText [(ngModel)]="currentVendor.account" class="w-full mb-2">

    <div class="flex justify-end gap-2 mt-2">
      <button pButton label="Cancel" class="p-button-secondary" (click)="cancelVendor()"></button>
      <button pButton label="Save" class="p-button-success" (click)="saveVendor()"></button>
    </div>
  </p-dialog>

  <p-confirmDialog></p-confirmDialog>
</div>

  `,
})
export class JournalEntriesComponent {
  journalEntries: any[] = [];
  displayDialog = false;
  isEdit = false;
  currentJournal: any = { id: 0, date: '', entries: [], totalDebit: 0, totalCredit: 0 };

  accounts = [
    { name: 'Cash', code: '10101' },
    { name: 'Bank', code: '10102' },
    { name: 'Sales', code: '40101' },
    { name: 'Purchases', code: '50101' },
    { name: 'rjh', code: '10120' },
    { name: 'enma', code: '10130' },
    { name: 'belad', code: '40140' },
    { name: 'riadh', code: '50120' },
    { name: 'sab', code: '60101' }
  ];

  costCenters = [
    { name: 'Main', code: '1001' },
    { name: 'Branch1', code: '1002' },
    { name: 'Branch2', code: '1003' },
     { name: 'Branch1', code: '1002' },
    { name: 'Branch2', code: '1003' },
     { name: 'Branch1', code: '1002' },
    { name: 'Branch2', code: '1003' },
    { name: 'ProjectX', code: '2001' }
  ];

  tags = [{ name: 'Urgent' }, { name: 'Internal' }, { name: 'External' }, { name: 'Follow-up' }];

  vendors = [
    { id: 1, name: 'Vendor A', account: '20101' },
     { id: 2, name: 'Vendor A', account: '20102' },
      { id: 3, name: 'Vendor A', account: '20103' },
       { id: 4, name: 'Vendor A', account: '20104' },
        { id: 5, name: 'Vendor A', account: '20105' },
         { id: 6, name: 'Vendor A', account: '20106' },
          { id: 7, name: 'Vendor A', account: '20107' },
    { id: 8, name: 'Vendor B', account: '20108' }
  ];

  accountDialog = false;
  costCenterDialog = false;
  vendorDialog = false;
  accountFilter = '';
  costCenterFilter = '';
  vendorFilter = '';
  editingRowIndex = 0;
  editingField: 'account' | 'costCenter' | 'vendor' = 'account';

  selectedRowIndex = -1;
  selectedLine: any = null;
  copiedLine: any = null;

  undoStack: any[] = [];
  redoStack: any[] = [];

  vendorFormDialog = false;
  isEditVendor = false;
  currentVendor: any = { id: 0, name: '', account: '' };

   journalIdFilter: string = '';

  contextMenuItems = [
    { label: 'Copy Line', icon: 'pi pi-copy', command: () => this.copyLine() },
    { label: 'Paste Line', icon: 'pi pi-clone', command: () => this.pasteLine() },
    { label: 'Delete Line', icon: 'pi pi-trash', command: () => this.removeJournalLine(this.selectedRowIndex) }
  ];
  constructor(private messageService: MessageService, private confirmationService: ConfirmationService) {
    this.journalEntries = [
      {
        id: 1,
        date: new Date().toISOString().substring(0, 10),
        entries: [{ account: 'Cash', description: 'Opening', debit: 1000, credit: 0, costCenter: 'Main', tags: ['Internal'] }],
        totalDebit: 1000,
        totalCredit: 0
      }
    ];
  }
 

matchesJournalFilter(journal: any): boolean {
  if (!this.journalIdFilter) return true; // إذا لم يوجد بحث، عرض كل القيود
  return journal.id.toString().includes(this.journalIdFilter);
}


  // 🟢 إضافة / تعديل / حذف
  openNewJournal() {
    this.isEdit = false;
    this.currentJournal = {
      id: this.journalEntries.length + 1,
      date: new Date().toISOString().substring(0, 10),
      entries: [{ account: '', accountCode: '', vendor: '', vendorAccount: '', description: '', debit: 0, credit: 0, costCenter: '', costCenterCode: '', tags: [] }],
      totalDebit: 0,
      totalCredit: 0
    };
    this.displayDialog = true;
  }

  editJournal(journal: any) {
    this.isEdit = true;
    this.currentJournal = JSON.parse(JSON.stringify(journal));
    this.displayDialog = true;
  }

  addJournalLine() {
    this.currentJournal.entries.push({ account: '', accountCode: '', vendor: '', vendorAccount: '', description: '', debit: 0, credit: 0, costCenter: '', costCenterCode: '', tags: [] });
    this.pushUndo();
  }

  removeJournalLine(index: number) {
    if (index >= 0) {
      this.currentJournal.entries.splice(index, 1);
      this.calculateCurrentTotals();
      this.pushUndo();
    }
  }


  calculateTagTotal(tagName: string) {
    return this.currentJournal.entries.filter((l: any) => l.tags?.includes(tagName))
      .reduce((sum: any, l: any) => sum + (Number(l.debit || 0) + Number(l.credit || 0)), 0);
  }




  saveJournal() {
    let valid = true;

    // تحقق من كل سطر
    this.currentJournal.entries.forEach((line: any) => {
      // الحساب
      const acc = this.accounts.find(a => a.code === line.accountCode || a.name === line.account);
      line.invalidAccount = !acc;
      if (!acc) valid = false;

      // المورد
      const ven = this.vendors.find(v => v.account === line.vendorAccount || v.name === line.vendor);
      line.invalidVendor = !ven;
      if (!ven) valid = false;

      // مركز التكلفة
      const cc = this.costCenters.find(c => c.code === line.costCenterCode || c.name === line.costCenter);
      line.invalidCostCenter = !cc;
      if (!cc) valid = false;
    });

    // تحقق من تساوي المدين والدائن
    this.calculateCurrentTotals();
    if (this.currentJournal.totalDebit !== this.currentJournal.totalCredit) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Total debit does not equal total credit' });
      valid = false;
    }

    if (!valid) {
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Please correct highlighted fields before saving' });
      return; // لا يتم الحفظ
    }

    // إذا كل شيء صحيح
    if (this.isEdit) {
      const index = this.journalEntries.findIndex(j => j.id === this.currentJournal.id);
      if (index > -1) this.journalEntries[index] = JSON.parse(JSON.stringify(this.currentJournal));
    } else {
      this.journalEntries.push(JSON.parse(JSON.stringify(this.currentJournal)));
    }

    this.displayDialog = false;
    this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Entry saved successfully' });
  }

  deleteJournal(index: number) {
    this.confirmationService.confirm({
      message: 'Do you want to delete this entry?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.journalEntries.splice(index, 1);
        this.messageService.add({ severity: 'info', summary: 'Deleted', detail: 'Entry deleted successfully' });
      }
    });
  }


  formatWithCommas(line: any, field: 'debit' | 'credit') {
    let val = line[field] ? line[field].toString().replace(/,/g, '') : '';

    if (val === '') return;

    // نتأكد أن القيمة رقمية
    if (!isNaN(Number(val))) {
      // تنسيق الرقم مع الفواصل
      line[field] = Number(val).toLocaleString('en-US', {
        maximumFractionDigits: 2
      });
    }

    // منع إدخال في المدين والدائن بنفس الوقت
    if (field === 'debit' && line.debit) line.credit = null;
    if (field === 'credit' && line.credit) line.debit = null;

    this.calculateCurrentTotals();
  }

  calculateCurrentTotals() {
    this.currentJournal.totalDebit = this.currentJournal.entries.reduce((sum: any, line: any) => {
      const val = parseFloat((line.debit || '0').toString().replace(/,/g, ''));
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    this.currentJournal.totalCredit = this.currentJournal.entries.reduce((sum: any, line: any) => {
      const val = parseFloat((line.credit || '0').toString().replace(/,/g, ''));
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  }



  // للـ F9 كما كان
  openAccountSearch(event: any, rowIndex: number) {
    this.editingRowIndex = rowIndex;
    if (event.key === 'F9') {
      this.accountDialog = true;
    }
  }

  // الكتابة المباشرة
  handleAccountInput(event: any, rowIndex: number) {
    const inputValue = event.target.value.trim();
    const found = this.accounts.find(a => a.code === inputValue || a.name === inputValue);
    const line = this.currentJournal.entries[rowIndex];

    if (found) {
      line.account = found.name;
      line.accountCode = found.code;
      line.invalidAccount = false;
    } else {
      line.invalidAccount = inputValue !== '';
    }
  }


  openCostCenterSearch(event: any, rowIndex: number) {
    this.editingRowIndex = rowIndex;
    if (event.key === 'F9') { this.costCenterDialog = true; }
  }

  handleCostCenterInput(event: any, rowIndex: number) {
    const inputValue = event.target.value.trim();
    const found = this.costCenters.find(c => c.code === inputValue || c.name === inputValue);

    const line = this.currentJournal.entries[rowIndex];
    if (found) {
      line.costCenter = found.name;
      line.costCenterCode = found.code;
      line.invalidCostCenter = false;
    } else {
      line.invalidCostCenter = inputValue !== '';
    }
  }


  openVendorDialog(event: any, rowIndex: number) {
    this.editingRowIndex = rowIndex;
    if (event.key === 'F9') { this.vendorDialog = true; }
  }

  handleVendorInput(event: any, rowIndex: number) {
    const inputValue = event.target.value.trim();
    const found = this.vendors.find(v => v.account === inputValue || v.name === inputValue);

    const line = this.currentJournal.entries[rowIndex];
    if (found) {
      line.vendor = found.name;
      line.vendorAccount = found.account;
      line.invalidVendor = false;
    } else {
      line.invalidVendor = inputValue !== '';
    }
  }


  // 🟢 الفلاتر
  filteredAccounts() {
    const filter = this.accountFilter.trim();
    if (!filter) return this.accounts;
    return this.accounts.filter(a =>
      a.name.toLowerCase().includes(filter.toLowerCase()) ||
      a.code.includes(filter)
    );
  }

  selectAccount(acc: any) {
    const line = this.currentJournal.entries[this.editingRowIndex];
    line.account = acc.name;
    line.accountCode = acc.code;
    this.accountDialog = false;
    line.invalidAccount = false;
    this.accountFilter = '';
  }

  filteredCostCenters() {
    const filter = this.costCenterFilter.trim();
    if (!filter) return this.costCenters;
    return this.costCenters.filter(c =>
      c.name.toLowerCase().includes(filter.toLowerCase()) ||
      c.code.includes(filter)
    );
  }

  selectCostCenter(cc: any) {
    const line = this.currentJournal.entries[this.editingRowIndex];
    line.costCenter = cc.name;
    line.costCenterCode = cc.code;
    this.costCenterDialog = false;
    line.invalidAccount = false;
    this.costCenterFilter = '';
  }

  filteredVendors() {
    const filter = this.vendorFilter.trim();
    if (!filter) return this.vendors;
    return this.vendors.filter(v =>
      v.name.toLowerCase().includes(filter.toLowerCase()) ||
      v.account.includes(filter)
    );
  }

  selectVendor(vn: any) {
    const line = this.currentJournal.entries[this.editingRowIndex];
    line.vendor = vn.name;
    line.vendorAccount = vn.account;
    this.vendorDialog = false;
    line.invalidAccount = false;
    this.vendorFilter = '';
  }

  // 🟢 Vendor form
  openAddVendor() {
    this.isEditVendor = false;
    this.currentVendor = { id: this.vendors.length + 1, name: '', account: '' };
    this.vendorFormDialog = true;
  }

  openEditVendor(vendor: any) {
    this.isEditVendor = true;
    this.currentVendor = JSON.parse(JSON.stringify(vendor));
    this.vendorFormDialog = true;
  }

  saveVendor() {
    if (this.isEditVendor) {
      const index = this.vendors.findIndex(v => v.id === this.currentVendor.id);
      if (index > -1) this.vendors[index] = JSON.parse(JSON.stringify(this.currentVendor));
    } else {
      this.vendors.push(JSON.parse(JSON.stringify(this.currentVendor)));
    }
    this.vendorFormDialog = false;
  }

  cancelVendor() {
    this.vendorFormDialog = false;
  }



  // 🟢 نسخ / لصق
  copyLine() { if (this.selectedRowIndex >= 0) { this.copiedLine = { ...this.currentJournal.entries[this.selectedRowIndex] }; this.messageService.add({ severity: 'info', summary: 'Copied', detail: 'Line copied' }); } }
  pasteLine() { if (this.copiedLine) { this.currentJournal.entries.splice(this.selectedRowIndex + 1, 0, { ...this.copiedLine }); this.messageService.add({ severity: 'success', summary: 'Pasted', detail: 'Line pasted' }); this.calculateCurrentTotals(); this.pushUndo(); } }

  // 🟢 Undo / Redo
  pushUndo() { this.undoStack.push(JSON.stringify(this.currentJournal.entries)); if (this.undoStack.length > 50) this.undoStack.shift(); }
  undo() { if (this.undoStack.length > 0) { this.redoStack.push(JSON.stringify(this.currentJournal.entries)); this.currentJournal.entries = JSON.parse(this.undoStack.pop()!); this.calculateCurrentTotals(); } }
  redo() { if (this.redoStack.length > 0) { this.undoStack.push(JSON.stringify(this.currentJournal.entries)); this.currentJournal.entries = JSON.parse(this.redoStack.pop()!); this.calculateCurrentTotals(); } }



  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent) {
    const key = event.key ? event.key.toLowerCase() : '';

    if (event.ctrlKey) {
      switch (key) {
        case 'c': case 'ؤ': this.copyLine(); event.preventDefault(); break;
        case 'v': case 'ر': this.pasteLine(); event.preventDefault(); break;
        case 'x': case 'ء': this.copyLine(); this.removeJournalLine(this.selectedRowIndex); event.preventDefault(); break;
        case 'z': case 'ئ': this.undo(); event.preventDefault(); break;
        case 'y': case 'غ': this.redo(); event.preventDefault(); break;
      }
    } else if (key === 'delete' && this.selectedRowIndex >= 0) { this.removeJournalLine(this.selectedRowIndex); event.preventDefault(); }
  }



  // 🟢 الطباعة
  printEntry(journal: any) {
    const lines = journal.entries.map((line: any) => `
        <tr>
          <td>${line.account}</td>
          <td>${line.description}</td>
          <td>${line.debit}</td>
          <td>${line.credit}</td>
          <td>${line.costCenter}</td>
          <td>${line.tags?.join(', ')}</td>
        </tr>
      `).join('');
    const html = `
        <html>
        <head>
          <title>Entry #${journal.id}</title>
          <style>
            body {font-family: Arial, sans-serif;}
            h2 {text-align:center;}
            table {width:100%; border-collapse: collapse; margin-bottom:10px;}
            th, td {border: 1px solid #000; padding: 5px; text-align: left;}
            th {background: #eee;}
            .footer {margin-top:20px; display:flex; justify-content:space-between;}
          </style>
        </head>
        <body>
          <h2>Company Name</h2>
          <h3>Journal Entry #${journal.id} - ${journal.date}</h3>
          <table>
            <tr>
              <th>Account</th><th>Description</th><th>Debit</th><th>Credit</th><th>Cost Center</th><th>Tags</th>
            </tr>
            ${lines}
            <tr>
              <td colspan="2" style="text-align:right"><strong>Total:</strong></td>
              <td>${journal.totalDebit}</td>
              <td>${journal.totalCredit}</td>
              <td></td>
              <td></td>
            </tr>
          </table>
          <div class="footer">
            <span>Prepared By: __________</span>
            <span>Approved By: __________</span>
          </div>
        </body>
        </html>
      `;
    const newWindow = window.open('', '_blank');
    newWindow?.document.write(html);
    newWindow?.document.close();
    newWindow?.print();
  }
}
