import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { MultiSelectModule } from 'primeng/multiselect';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
<div class="card">
  <p-toast></p-toast>
  <h2 class="text-3xl font-bold mb-6">Trial Balance </h2>

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

  <button pButton label="Export to Excel" icon="pi pi-file-excel" class="p-button-success" (click)="exportExcel()"></button>
</div>

  <p-table [value]="filteredData"
         [paginator]="true"
         [rows]="10"
         [scrollable]="true"
         [scrollHeight]="'300px'"
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
        <td>{{line.date}}</td>
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
  trialData = [
    {account: 'Cash', debit: 1200, credit: 0, costCenter: 'Main', entries:[
      {date:'2025-09-20', description:'Opening', debit:1200, credit:0, costCenter:'Main'},
      {date:'2025-09-20', description:'Opening', debit:0, credit:200, costCenter:'Main'},
      {date:'2025-09-21', description:'Opening', debit:0, credit:1000, costCenter:'Main'}
    ]},
    {account: 'Bank', debit: 500, credit: 0, costCenter: 'Branch1', entries:[
      {date:'2025-09-21', description:'Deposit', debit:1000, credit:0, costCenter:'Branch1'},
      {date:'2025-09-21', description:'Deposit', debit:0, credit:1000, costCenter:'Branch1'}
    ]},
    {account: 'Sales', debit:0, credit:1500, costCenter: 'Branch2', entries:[
      {date:'2025-09-22', description:'Invoice #1001', debit:0, credit:1000, costCenter:'Branch2'},
      {date:'2025-09-22', description:'Invoice #1004', debit:1000, credit:0, costCenter:'Branch2'}
    ]}
  ];

  // MultiSelect options
  accountsOptions = [
    {name: 'Cash'}, {name: 'Bank'}, {name: 'Sales'}, {name: 'Purchases'}, {name: 'Expenses'}
  ];
  costCentersOptions = [
    {name: 'Main'}, {name: 'Branch1'}, {name: 'Branch2'}, {name: 'ProjectX'}
  ];

  // MultiSelect selected values
  selectedAccounts: any[] = [];
  selectedCostCenters: any[] = [];

  filteredData = [...this.trialData];

  detailsDialog = false;
  currentDetails: any[] = [];
currentAccountName: string = '';

  constructor(private messageService: MessageService){}

  applyFilter(){
    this.filteredData = this.trialData.filter(row=>{
      const accountMatch = this.selectedAccounts.length ? this.selectedAccounts.some(a=>a.name === row.account) : true;
      const centerMatch = this.selectedCostCenters.length ? this.selectedCostCenters.some(c=>c.name === row.costCenter) : true;
      return accountMatch && centerMatch;
    });
  }

  clearFilters(){
    this.selectedAccounts = [];
    this.selectedCostCenters = [];
    this.filteredData = [...this.trialData];
  }

viewDetails(row: any) {
  this.currentDetails = row.entries;
  this.currentAccountName = row.account;   // نخزن اسم الحساب
  this.detailsDialog = true;
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


getTotal(type: 'debit' | 'credit') {
  return this.filteredData.reduce((sum, row) => {
    const rowTotal = row.entries?.reduce((entrySum: number, e: any) => entrySum + (e[type] || 0), 0) || 0;
    return sum + rowTotal;
  }, 0);
}

getRowTotal(row: any, type: 'debit' | 'credit') {
  return row.entries?.reduce((sum: number, e: any) => sum + (e[type] || 0), 0) || 0;
}



}
