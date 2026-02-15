import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TrialBalanceService, TrialBalanceEntry } from '@/apiservice/trialbalance.service';
import { MultiSelectModule } from 'primeng/multiselect';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { LoaderService } from '@/apiservice/loading.service';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-trial-balance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    MultiSelectModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
<div class="card" style=" min-height: 70vh">
      <p-toast position="top-center" class="custom-toast"></p-toast>


 <div class="flex flex-wrap gap-4 mb-4 items-center">

  <!-- MultiSelect for Accounts -->
  <p-multiselect 
    [options]="accountsOptions" 
    [(ngModel)]="selectedAccounts" 
    optionLabel="name" 
    placeholder="Select Accounts" 
    display="chip" 
    [filter]="true" 
    [maxSelectedLabels]="3"
    (onChange)="applyFilter()">
  </p-multiselect>

  <!-- MultiSelect for Cost Centers -->
  <p-multiselect 
    [options]="costCentersOptions" 
    [(ngModel)]="selectedCostCenters" 
    optionLabel="name" 
    placeholder="Select Cost Centers" 
    display="chip" 
    [filter]="true" 
    [maxSelectedLabels]="3"
    (onChange)="applyFilter()">
  </p-multiselect>

  <!-- Clear Filters Button -->
  <button pButton label="Clear Filters" icon="pi pi-times" class="p-button-secondary" (click)="clearFilters()"></button>

  <button pButton label="Export to Excel" icon="pi pi-file-excel" class="p-button-success" (click)="exportExcel()" outlined></button>
</div>

  <p-table [value]="filteredData"
         [paginator]="true"
         [rows]="10"
         [scrollable]="true"
         [scrollHeight]="'400px'"
         [responsiveLayout]="'scroll'">

    <ng-template pTemplate="header">
      <tr>
        <th>Account</th>
        <th>Debit Balance</th>
        <th>Credit Balance</th>
        <th>Action</th>
      </tr>
    </ng-template>
   <ng-template pTemplate="body" let-row>
  <tr>
    <td>{{row.account}}</td>
    <td>{{ getRowTotal(row, 'debit') | currency }}</td>
    <td>{{ getRowTotal(row, 'credit') | currency }}</td>
    <td>
      <button pButton icon="pi pi-eye" class="p-button-info" (click)="viewDetails(row)"></button>
    </td>
  </tr>
</ng-template>

    <ng-template pTemplate="footer">
  <tr>
    <td class="font-bold">Total</td>
    <td class="font-bold">{{ getTotal('debit') | currency }}</td>
    <td class="font-bold">{{ getTotal('credit') | currency }}</td>
    <td></td>
  </tr>
</ng-template>

  </p-table>

  <!-- Dialog for Account Details -->
  <!-- Dialog for Account Details -->
<p-dialog header="Account Details" [(visible)]="detailsDialog" [style]="{width:'60vw'}">
  <p-table [value]="currentDetails" [paginator]="true" [rows]="5" [scrollable]="true" [scrollHeight]="'200px'">
    <ng-template pTemplate="header">
      <tr>
        <th>Date</th>
        <th>Description</th>
        <th>Debit</th>
        <th>Credit</th>
        <th>Cost Center</th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-line>
      <tr>
        <td>{{line.date | date:'yyyy-MM-dd'}}</td>
        <td>{{line.description}}</td>
        <td>{{line.debit | currency}}</td>
        <td>{{line.credit | currency}}</td>
        <td>{{line.costCenter}}</td>
      </tr>
    </ng-template>
  </p-table>

  <!-- زر تصدير التفاصيل -->
  <div class="mt-3">
    <button pButton 
            label="Export Details" 
            icon="pi pi-file-excel" 
            class="p-button-success"
            (click)="exportDetails()">
    </button>
  </div>
</p-dialog>

</div>
  `
})
export class TrialBalanceComponent {
    loading: boolean = false;
  trialData: TrialBalanceEntry[] = [];
  filteredData: TrialBalanceEntry[] = [];

  // MultiSelect
  accountsOptions: any[] = [];
  costCentersOptions: any[] = [];
  selectedAccounts: any[] = [];
  selectedCostCenters: any[] = [];

  detailsDialog = false;
  currentDetails: any[] = [];
  currentAccountName = '';




  constructor(
    private service: TrialBalanceService,
     private messageService: MessageService,
           private translate: TranslateService,
     public loaderService: LoaderService) { }



  ngOnInit() {
    this.loadTrialBalance();
  }

  loadTrialBalance() {
      this.loaderService.show(); // 🟢 تشغيل اللودنق قبل الطلب
    this.service.getTrialBalance().subscribe({
      next: (data) => {
        // استبعاد الحسابات صفرية
        this.trialData = data.filter(d => d.totalDebit !== 0 || d.totalCredit !== 0);
        this.filteredData = [...this.trialData];

        // ملء خيارات الحسابات و الـ cost centers
        this.accountsOptions = this.trialData.map(d => ({ name: d.account }));
        const costCentersSet = new Set<string>();
        this.trialData.forEach(d => d.entries.forEach(e => costCentersSet.add(e.costCenter)));
        this.costCentersOptions = Array.from(costCentersSet).map(c => ({ name: c }));
          this.loaderService.hide(); // 🟢 إيقاف اللودنق عند الخطأ
      },
          error: (err) => {
      console.error('Failed to load trial balance', err);
      this.loaderService.hide(); // 🟢 إيقاف اللودنق عند الخطأ
    this.loaderService.hide(); // إيقاف اللودنق عند الخطأ

  this.translate.get(['TOAST.ERROR_SUMMARY','TOAST.ERROR_DETAIL_500']).subscribe(trans => {
    this.messageService.add({
      severity: 'error',
      summary: trans['TOAST.ERROR_SUMMARY'],
      detail: trans['TOAST.ERROR_DETAIL_500']
    });

      });
    }

    });
  }

  applyFilter() {
    this.filteredData = this.trialData.filter(row => {
      const accountMatch = this.selectedAccounts.length ? this.selectedAccounts.some(a => a.name === row.account) : true;
      const centerMatch = this.selectedCostCenters.length ? this.selectedCostCenters.some(c => row.entries.some(e => e.costCenter === c.name)) : true;
      return accountMatch && centerMatch;
    });
  }

  clearFilters() {
    this.selectedAccounts = [];
    this.selectedCostCenters = [];
    this.filteredData = [...this.trialData];
  }

  viewDetails(row: TrialBalanceEntry) {
    this.currentDetails = row.entries;
    this.currentAccountName = row.account;
    this.detailsDialog = true;
  }

  getTotal(type: 'debit' | 'credit') {
    return this.filteredData.reduce((sum, row) => sum + row.entries.reduce((s, e) => s + e[type], 0), 0);
  }

  getRowTotal(row: TrialBalanceEntry, type: 'debit' | 'credit') {
    return row.entries.reduce((sum, e) => sum + e[type], 0);
  }

  exportExcel() {
    const worksheet = XLSX.utils.json_to_sheet(this.filteredData);
    const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'TrialBalance.xlsx');
  }


  exportDetails() {
    if (!this.currentDetails || this.currentDetails.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Data',
        detail: 'No details available to export'
      });
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(this.currentDetails);
    const sheetName = this.currentAccountName || 'Details';   // اسم الشيت حسب الحساب
    const workbook = { Sheets: { [sheetName]: worksheet }, SheetNames: [sheetName] };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    // اسم الملف برضو حسب الحساب
    const fileName = `AccountDetails_${sheetName}.xlsx`;
    saveAs(data, fileName);
  }






}
