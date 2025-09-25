import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-trial-balance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
<div class="p-6 bg-white shadow-lg rounded-lg">
  <p-toast></p-toast>

  <h2 class="text-3xl font-bold mb-6">Trial Balance</h2>

  <div class="flex gap-4 mb-4">
    <input type="text" pInputText placeholder="Search by Account" [(ngModel)]="searchAccount" (input)="applyFilter()">
    <input type="text" pInputText placeholder="Filter by Cost Center" [(ngModel)]="searchCostCenter" (input)="applyFilter()">
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
          <button pButton icon="pi pi-eye" class="p-button-rounded p-button-info" (click)="viewDetails(row)"></button>
        </td>
      </tr>
    </ng-template>
  </p-table>

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
    {account: 'Cash', debit: 1200, credit: 0, entries:[
      {date:'2025-09-20', description:'Opening', debit:1200, credit:0, costCenter:'Main'}
    ]},
    {account: 'Bank', debit: 500, credit: 0, entries:[
      {date:'2025-09-21', description:'Deposit', debit:500, credit:0, costCenter:'Branch1'}
    ]},
    {account: 'Sales', debit:0, credit:1500, entries:[
      {date:'2025-09-22', description:'Invoice #1001', debit:0, credit:1500, costCenter:'Main'}
    ]}
  ];

  searchAccount = '';
  searchCostCenter = '';
  filteredData = [...this.trialData];

  detailsDialog = false;
  currentDetails: any[] = [];

  constructor(private messageService: MessageService){}

  applyFilter(){
    this.filteredData = this.trialData.filter(row=>{
      const matchesAccount = row.account.toLowerCase().includes(this.searchAccount.toLowerCase());
      const matchesCenter = row.entries.some(e=>e.costCenter.toLowerCase().includes(this.searchCostCenter.toLowerCase()));
      return matchesAccount && matchesCenter;
    });
  }

  viewDetails(row:any){
    this.currentDetails = row.entries;
    this.detailsDialog = true;
  }

  exportExcel(){
    this.messageService.add({severity:'info', summary:'Export', detail:'Export to Excel not implemented yet'});
  }
}
