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
import { PaginatorModule } from 'primeng/paginator';

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
    PaginatorModule,
    MultiSelectModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
 <div class="card">
  <p-toast></p-toast>
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
<p-table 
  [value]="filteredJournals(journalIdFilter)" 
  [paginator]="true" 
  [rows]="10" 
  [responsiveLayout]="'scroll'" 
  [scrollable]="true" 
  scrollHeight="400px">

  <ng-template pTemplate="header">
    <tr class="bg-gray-100 sticky top-0 z-10">
      <th>#</th>
      <th>Date</th>
      <th>Total Debit</th>
      <th>Total Credit</th>
      <th>Actions</th>
    </tr>
  </ng-template>

  <ng-template pTemplate="body" let-journal let-i="rowIndex">
    <tr>
      <td>{{journal.id}}</td>
      <td>{{journal.date | date:'yyyy-MM-dd'}}</td>
      <td>{{journal.totalDebit | number:'1.2-2'}}</td>
      <td>{{journal.totalCredit | number:'1.2-2'}}</td>
      <td class="flex gap-2">
        <button pButton icon="pi pi-pencil" class="p-button-info p-button-sm" (click)="editJournal(journal)"></button>
        <button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" (click)="deleteJournal(i)"></button>
        <button pButton icon="pi pi-print" class="p-button-warning p-button-sm" (click)="printEntry(journal)"></button>
      </td>
    </tr>
  </ng-template>

  <ng-template pTemplate="emptymessage">
    <tr>
      <td colspan="5">
        <div class="flex flex-col items-center justify-center h-full py-10">
          <i class="pi pi-database" style="font-size: 2rem"></i>
          <span class="text-gray-500 text-lg text-center">
            {{ filteredJournals(journalIdFilter).length ? 'No results found for your search' : 'No Data Available' }}
          </span>
        </div>
      </td>
    </tr>
  </ng-template>

</p-table>



<p-dialog 
    header="{{isEdit ? 'Edit Entry' : 'New Entry'}}"
    [(visible)]="displayDialog" 
    [modal]="true"
    [style]="{width:'90vw', height:'100vh'}" 
    [closable]="false">

  <div class="flex flex-col h-full bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">

    <!-- ======= الهيدر ======= -->
    <div class="border-b border-gray-200 dark:border-gray-700  grid grid-cols-12 gap-6 items-center">

      <div class="col-span-3 flex flex-col">
        <label class="font-semibold text-gray-700 dark:text-gray-300 mb-1">Entry No.</label>
        
        <input type="text"
               [(ngModel)]="currentJournal.id"
               class="p-inputtext w-full rounded-md px-3 py-2 bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-200"
               readonly>
      </div>

      <div class="col-span-2 flex flex-col">
        <label class="font-semibold text-gray-700 dark:text-gray-300 mb-2">Date</label>
        <p-datepicker [(ngModel)]="currentJournal.date"
                      [showIcon]="true"
                      inputStyleClass="w-full px-3 py-2 rounded-md bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-200"></p-datepicker>
      </div>

      <div class="col-span-2 flex flex-col">
        <label class="font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</label>
        <select [(ngModel)]="currentJournal.status"
                class="p-inputtext w-full rounded-md px-3 py-2 bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-200">
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      <div class="col-span-2 flex flex-col">
        <label class="font-semibold text-gray-700 dark:text-gray-300 mb-2">Entry Type</label>
        <select [(ngModel)]="currentJournal.type"
                class="p-inputtext w-full rounded-md px-3 py-2 bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-200">
          <option value="Daily">Daily</option>
          <option value="Adjustment">Adjustment</option>
          <option value="Closing">Closing</option>
        </select>
      </div>

      <div class="col-span-3 flex flex-col">
        <label class="font-semibold text-gray-700 dark:text-gray-300 mb-2">Summary</label>
        <input type="text"
               [value]="(currentJournal.totalDebit + currentJournal.totalCredit) | number:'1.2-2'"
               class="p-inputtext w-full text-right font-semibold text-blue-500 rounded-md px-3 py-2 bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-200"
               readonly>
      </div>

      <div class="col-span-12 mt-4 flex flex-col">
        <label class="font-semibold text-gray-700 dark:text-gray-300 mb-2">Notes</label>
        <textarea [(ngModel)]="currentJournal.notes"
                  class="p-inputtext w-full rounded-md px-3 py-2 bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-200"
                  rows="3"
                  placeholder="Add notes..."></textarea>
      </div>

    </div>

    <!-- ======= الجدول ======= -->
    <div class="flex-1 overflow-auto min-h-[320px] mt-2">
      <p-table [value]="currentJournal.entries"
               [scrollable]="true"
               scrollHeight="100%"
               selectionMode="single"
               [(contextMenuSelection)]="selectedLine"
               [contextMenu]="cm"
               class="fixed-rows-table w-full">

        <ng-template pTemplate="header">
          <tr class="bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-200">
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
          <tr (click)="selectedRowIndex=i" class="hover:bg-gray-200 dark:hover:bg-gray-600">
            <td>{{ i + 1 }}</td>

            <td>
              <input type="text" [(ngModel)]="line.account"
                     (input)="handleAccountInput($event, i)"
                     (keydown)="openAccountSearch($event, i)"
                     (keydown.enter)="addNewLine(i); $event.preventDefault()"
                     [class.p-invalid]="line.invalidAccount"
                     [id]="'account-' + i"
                     placeholder="Account No. or F9 to Search"
                     class="p-inputtext w-full bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-200">
            </td>

            <td>
              <input type="text" [(ngModel)]="line.vendor"
                     (input)="handleVendorInput($event,i)"
                     (keydown)="openVendorDialog($event,i)"
                     [disabled]="!line.isVendorEnabled"
                     (keydown.enter)="addNewLine(i); $event.preventDefault()"
                     [class.p-invalid]="line.invalidVendor"
                     placeholder="Vendor No. or F9 to Search"
                     class="p-inputtext w-full bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-200">
            </td>

            <td>
              <input type="text" [(ngModel)]="line.description"
                     (keydown.enter)="addNewLine(i); $event.preventDefault()"
                     class="p-inputtext w-full bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-200"
                     placeholder="Description"
                     style="width: 300px;">
            </td>

            <td>
              <input type="text"
                     [(ngModel)]="line.debit"
                     (focus)="formatWithCommas(line, 'debit')"
                     (input)="formatWithCommas(line, 'debit'); updateTotals()"
                     (keydown.enter)="addNewLine(i); $event.preventDefault()"
                     class="p-inputtext w-full text-right bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-200"
                     placeholder="0.00">
            </td>

            <td>
              <input type="text"
                     [(ngModel)]="line.credit"
                     (focus)="formatWithCommas(line, 'credit')"
                     (input)="formatWithCommas(line, 'credit'); updateTotals()"
                     (keydown.enter)="addNewLine(i); $event.preventDefault()"
                     class="p-inputtext w-full text-right bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-200"
                     placeholder="0.00">
            </td>

            <td>
              <input type="text" [(ngModel)]="line.costCenter"
                     (input)="handleCostCenterInput($event,i)"
                     (keydown)="openCostCenterSearch($event,i)"
                     (keydown.enter)="addNewLine(i); $event.preventDefault()"
                     [class.p-invalid]="line.invalidCostCenter"
                     placeholder="CostCenter No. or F9 to Search"
                     class="p-inputtext w-full bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-200">
            </td>

            <td>
              <p-multiSelect [options]="tags" [(ngModel)]="line.tags"
                             optionLabel="name" display="chip"
                             defaultLabel="Select tags" [filter]="true"
                             styleClass="dark:text-white dark:bg-gray-700"
                             (keydown.enter)="addNewLine(i); $event.preventDefault()"></p-multiSelect>
            </td>

            <td>
              <button pButton icon="pi pi-trash" class="p-button p-button-danger p-button-sm"
                      (click)="removeJournalLine(i)"></button>
            </td>
          </tr>
        </ng-template>

      </p-table>
    </div>

    <p-contextMenu #cm [model]="contextMenuItems"></p-contextMenu>

    <!-- ======= الفوتر ======= -->
    <div class="border-t border-gray-200 dark:border-gray-700 pt-4 pb-4 px-5 flex flex-col gap-3 bg-gray-50 dark:bg-gray-800">

      <div class="h-6 flex items-center justify-center">
        <div *ngIf="!isBalanced()" class="text-red-600 font-bold text-center mb-2">
          ⚠️ Debit and Credit must be equal
        </div>
      </div>

      <div class="flex justify-between items-start">
        <div class="flex flex-col text-left font-bold text-gray-700 dark:text-gray-300">
          <div>Total Debit.: {{currentJournal.totalDebit | number:'1.2-2'}}</div>
          <div>Total Credit: {{currentJournal.totalCredit | number:'1.2-2'}}</div>
        </div>

        <div class="flex gap-2">
          <button pButton label="Cancel" icon="pi pi-times" class="p-button-secondary"
                  (click)="displayDialog=false"></button>
          <button pButton label="Save" icon="pi pi-check" class="p-button-success"
                  (click)="saveJournal()"></button>
        </div>
      </div>

    </div>

  </div>
</p-dialog>




<!-- Dialog الموردين -->
<p-dialog header="Vendors" [(visible)]="vendorDialog" [modal]="true"
          [style]="{'width':'50vw','height':'450px'}" [resizable]="false"
          [breakpoints]="{'960px':'90vw'}">

  <div class="flex flex-col h-full">

    <!-- الهيدر ثابت -->
    <div class="flex gap-2 mb-2 flex-shrink-0">
      <input type="text" pInputText [(ngModel)]="vendorFilter"
             placeholder="Search vendor..." class="flex-1"
             (input)="filteredVendors()">
      <button pButton label="Add Vendor" icon="pi pi-plus"
              class="p-button-success" (click)="openAddVendor()"></button>
    </div>

    <!-- الجدول scrollable -->
    <div class="flex-1 overflow-auto min-h-[250px]">
      <p-table [value]="filteredVendors()" [scrollable]="true" scrollHeight="100%">
        <ng-template pTemplate="header">
          <tr>
            <th>#</th>
            <th>Vendor Name</th>
            <th>Account No</th>
            <th>Actions</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-vn let-i="rowIndex">
          <tr style="height:50px" (click)="selectVendor(vn)" class="cursor-pointer hover:bg-gray-200">
            <td>{{i + 1}}</td>
            <td>{{vn.name}}</td>
            <td>{{vn.account}}</td>
            <td class="flex gap-2">
              <button pButton icon="pi pi-pencil"
                      class="p-button-sm p-button-info"
                      (click)="openEditVendor(vn); $event.stopPropagation()"></button>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="4">
              <div class="flex flex-col items-center justify-center h-full py-10">
                <i class="pi pi-database " style="font-size: 2rem"></i>
                <span class="text-gray-500 text-lg">No Data Available</span>
              </div>
            </td>
          </tr>
        </ng-template>

      </p-table>
    </div>

    <!-- الفوتر ثابت -->
 <div class="flex-shrink-0 mt-2 border-t pt-2 
            bg-white border-gray-200 
            dark:bg-[#18181b] dark:border-gray-700">
  <p-paginator 
    [rows]="5" 
    [totalRecords]="filteredVendors().length || 0"
   >
  </p-paginator>
</div>


  </div>
</p-dialog>

<!-- Dialog الحسابات -->
<p-dialog header="Select Account" [(visible)]="accountDialog" [modal]="true"
          [style]="{'width':'50vw','height':'450px'}" [resizable]="false"
          [breakpoints]="{'960px':'90vw'}">

  <div class="flex flex-col h-full">

    <!-- الهيدر ثابت -->
    <div class="mb-2 flex-shrink-0">
      <input type="text" pInputText [(ngModel)]="accountFilter"
             placeholder="Search account..." class="w-full"
             (input)="filteredAccounts()">
    </div>

    <!-- الجدول scrollable -->
    <div class="flex-1 overflow-auto min-h-[250px]">
      <p-table [value]="filteredAccounts()" [scrollable]="true" scrollHeight="100%">
        <ng-template pTemplate="header">
          <tr>
            <th>#</th>
            <th>Account Name</th>
            <th>Account No</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-acc let-i="rowIndex">
          <tr style="height:50px" (click)="selectAccount(acc)" class="cursor-pointer hover:bg-gray-200">
            <td>{{i + 1}}</td>
            <td>{{acc.name}}</td>
            <td>{{acc.code}}</td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="3">
              <div class="flex flex-col items-center justify-center h-full py-10">
                <i class="pi pi-database " style="font-size: 2rem"></i>
                <span class="text-gray-500 text-lg">No Data Available</span>
              </div>
            </td>
          </tr>
        </ng-template>

      </p-table>
    </div>

    <!-- الفوتر ثابت -->
   <div class="flex-shrink-0 mt-2 border-t pt-2 
            bg-white border-gray-200 
            dark:bg-[#18181b] dark:border-gray-700">
  <p-paginator 
    [rows]="5" 
    [totalRecords]="filteredVendors().length || 0"
   >
  </p-paginator>
</div>


  </div>
</p-dialog>

<!-- Dialog مراكز التكلفة -->
<p-dialog header="Select Cost Center" [(visible)]="costCenterDialog" [modal]="true"
          [style]="{'width':'50vw','height':'450px'}" [resizable]="false"
          [breakpoints]="{'960px':'90vw'}">

  <div class="flex flex-col h-full">

    <!-- الهيدر ثابت -->
    <div class="mb-2 flex-shrink-0">
      <input type="text" pInputText [(ngModel)]="costCenterFilter"
             placeholder="Search cost center..." class="w-full"
             (input)="filteredCostCenters()">
    </div>

    <!-- الجدول scrollable -->
    <div class="flex-1 overflow-auto min-h-[250px]">
      <p-table [value]="filteredCostCenters()" [scrollable]="true" scrollHeight="100%">
        <ng-template pTemplate="header">
          <tr>
            <th>#</th>
            <th>Cost Center Name</th>
            <th>Cost Center No</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-cc let-i="rowIndex">
          <tr style="height:50px" (click)="selectCostCenter(cc)" class="cursor-pointer hover:bg-gray-200">
            <td>{{i + 1}}</td>
            <td>{{cc.name}}</td>
            <td>{{cc.code}}</td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="3">
              <div class="flex flex-col items-center justify-center h-full py-10">
              
                <i class="pi pi-database " style="font-size: 2rem"></i>
                <span class="text-gray-500 text-lg">No Data Available</span>
              </div>
            </td>
          </tr>
        </ng-template>

      </p-table>
    </div>

    <!-- الفوتر ثابت -->
    <div class="flex-shrink-0 mt-2 border-t pt-2 
            bg-white border-gray-200 
            dark:bg-[#18181b] dark:border-gray-700">
  <p-paginator 
    [rows]="5" 
    [totalRecords]="filteredVendors().length || 0"
   >
  </p-paginator>
</div>


  </div>
</p-dialog>

<!-- Dialog إضافة / تعديل مورد -->
<p-dialog header="{{isEditVendor ? 'Edit Vendor' : 'Add Vendor'}}"
          [(visible)]="vendorFormDialog" [modal]="true" [style]="{width:'40vw'}"
          [resizable]="true" [breakpoints]="{'960px':'90vw'}">

  <div class="flex flex-col h-full">

    <!-- محتوى الفورم -->
    <div class="flex-1 overflow-auto">
      <label class="block mb-1 font-semibold">Vendor Name</label>
      <input type="text" pInputText [(ngModel)]="currentVendor.name" class="w-full mb-2">

      <label class="block mb-1 font-semibold">Account No</label>
      <input type="text" pInputText [(ngModel)]="currentVendor.account" class="w-full mb-2">
    </div>

    <!-- الفوتر ثابت -->
    <div class="flex-shrink-0 mt-2 flex justify-end gap-2">
      <button pButton label="Cancel" class="p-button-secondary" (click)="cancelVendor()"></button>
      <button pButton label="Save" class="p-button-success" (click)="saveVendor()"></button>
    </div>

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


  currentJournal: any = {
    entries: [
      { account: '', debit: null, credit: null, description: '', costCenter: '', currency: 'SAR' }
    ],
    totalDebit: 0,
    totalCredit: 0
  };


  accounts = [
    { name: 'vendor', code: '10101' },
    { name: 'Bank', code: '10102' },
    { name: 'Sales', code: '40101' },
    { name: 'Purchases', code: '50101' },
    { name: 'rjh', code: '10120' },
    { name: 'enma', code: '10130' },
    { name: 'belad', code: '40140' },
    { name: 'riadh', code: '50120' },
    { name: 'Cash', code: '60101' }
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


  addNewLine(index: number) {
    if (!this.currentJournal.entries) {
      this.currentJournal.entries = [];
    }

    const newLine = {
      account: '',
      accountCode: '',
      vendor: '',
      vendorAccount: '',
      description: '',
      debit: 0,
      credit: 0,
      costCenter: '',
      costCenterCode: '',
      tags: [],
       isVendorEnabled: false 
    };

    if (index === -1) {
      this.currentJournal.entries.push(newLine);
    } else {
      this.currentJournal.entries.splice(index + 1, 0, newLine);
    }
  }




  isBalanced(): boolean {
    return this.currentJournal.totalDebit === this.currentJournal.totalCredit;
  }

  // عند أي تغيير في مدين أو دائن، يحدث حساب الإجماليات
  updateTotals() {
    if (!this.currentJournal || !this.currentJournal.entries) return;

    let totalDebit = 0;
    let totalCredit = 0;

    for (let line of this.currentJournal.entries) {
      totalDebit += parseFloat(line.debit) || 0;
      totalCredit += parseFloat(line.credit) || 0;
    }

    this.currentJournal.totalDebit = totalDebit;
    this.currentJournal.totalCredit = totalCredit;
  }


  // 🟢 إضافة / تعديل / حذف
  openNewJournal() {
    this.isEdit = false;
    this.currentJournal = {
      id: 'JE-' + new Date().getTime(), // توليد رقم تلقائي
      date: new Date().toISOString().substring(0, 10),
      status: 'Pending',               // الحالة الافتراضية
      type: 'Daily',                   // نوع القيد الافتراضي
      entries: [
        { account: '', accountCode: '', vendor: '', vendorAccount: '', description: '', debit: 0, credit: 0, costCenter: '', costCenterCode: '', tags: [] }
      ],
      totalDebit: 0,
      totalCredit: 0,
      notes: ''
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
    let val = line[field]?.toString().replace(/,/g, '');
    if (!val) return;

    const numericVal = Number(val);
    if (!isNaN(numericVal)) {
      line[field] = numericVal;
    }

    if (field === 'debit' && line.debit) line.credit = null;
    if (field === 'credit' && line.credit) line.debit = null;

    // حساب الإجماليات
    this.currentJournal.totalDebit = this.currentJournal.entries.reduce(
      (sum: number, entry: any) => sum + (entry.debit || 0), 0
    );
    this.currentJournal.totalCredit = this.currentJournal.entries.reduce(
      (sum: number, entry: any) => sum + (entry.credit || 0), 0
    );

    // إعادة تعيين المصفوفة لإخبار Angular بالتغيير
    this.currentJournal.entries = this.currentJournal.entries.slice();
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

    // ✅ التحقق إذا الحساب من الموردين
    if (found.name.toLowerCase().includes('vendor') || found.code.startsWith('201')) {
      line.isVendorEnabled = true;
    } else {
      line.isVendorEnabled = false;
      line.vendor = '';           // مسح قيمة المورد عند تعطيله
      line.vendorAccount = '';
    }

  } else {
    line.invalidAccount = inputValue !== '';
    line.isVendorEnabled = false;
    line.vendor = '';
    line.vendorAccount = '';
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

  
filteredJournals(filterText: string) {
  if (!this.journalEntries) return [];

  // تحويل الفلتر لأي نوع إلى نص وتجاهل المسافات
  const filter = filterText != null ? filterText.toString().trim().toLowerCase() : '';

  if (!filter) return this.journalEntries;

  return this.journalEntries.filter(j => {
    // نحول كل قيمة من السجلات إلى نص لمطابقتها مع الفلتر
    const id = j.id?.toString().toLowerCase() || '';
    const date = j.date?.toString().toLowerCase() || '';
    const totalDebit = j.totalDebit?.toString().toLowerCase() || '';
    const totalCredit = j.totalCredit?.toString().toLowerCase() || '';

    // تحقق إذا أي عمود يحتوي على النص المطلوب
    return id.includes(filter) || date.includes(filter) || totalDebit.includes(filter) || totalCredit.includes(filter);
  });
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
  if (this.selectedRowIndex >= 0) {
    const line = this.currentJournal.entries[this.selectedRowIndex];
    line.account = acc.name;
    line.accountCode = acc.code;

    // 🔹 لو الحساب مورّد، فعّل حقل المورد
    line.isVendorEnabled = acc.name.toLowerCase().includes('vendor') || acc.code.startsWith('10101');
    
    this.accountDialog = false;
  }
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
