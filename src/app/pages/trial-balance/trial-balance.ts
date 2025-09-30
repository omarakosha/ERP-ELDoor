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
<div class="p-6 bg-white shadow-lg rounded-lg">
  <p-toast></p-toast>

  <h2 class="text-3xl font-bold mb-6">Trial Balance</h2>

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

  <p-table [value]="filteredData" [paginator]="true" [rows]="10" [responsiveLayout]="'scroll'">
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
        <td>{{row.debit | currency}}</td>
        <td>{{row.credit | currency}}</td>
        <td>
          <button pButton icon="pi pi-eye" class="p-button-info" (click)="viewDetails(row)"></button>
        </td>
      </tr>
    </ng-template>
  </p-table>

  <!-- Dialog for Account Details -->
  <p-dialog header="Account Details" [(visible)]="detailsDialog" [style]="{width:'60vw'}">
    <p-table [value]="currentDetails">
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
  </p-dialog>
</div>
  `
})
export class TrialBalanceComponent {
  trialData = [
    {account: 'Cash', debit: 1200, credit: 0, costCenter: 'Main', entries:[
      {date:'2025-09-20', description:'Opening', debit:1200, credit:0, costCenter:'Main'}
    ]},
    {account: 'Bank', debit: 500, credit: 0, costCenter: 'Branch1', entries:[
      {date:'2025-09-21', description:'Deposit', debit:500, credit:0, costCenter:'Branch1'}
    ]},
    {account: 'Sales', debit:0, credit:1500, costCenter: 'Main', entries:[
      {date:'2025-09-22', description:'Invoice #1001', debit:0, credit:1500, costCenter:'Main'}
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

  viewDetails(row:any){
    this.currentDetails = row.entries;
    this.detailsDialog = true;
  }

  exportExcel(){
    this.messageService.add({severity:'info', summary:'Export', detail:'Export to Excel not implemented yet'});
  }
}
