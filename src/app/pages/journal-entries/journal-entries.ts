import { Component } from '@angular/core';
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
    DatePickerModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
<div class="p-6 bg-white shadow-lg rounded-lg" dir="ltr">

  <p-toast></p-toast>

  <h2 class="text-3xl font-bold mb-6">Journal Entries - قيود اليومية</h2>

  <div class="flex justify-between items-center mb-4">
    <button pButton label="New Entry" icon="pi pi-plus" class="p-button-success" (click)="openNewJournal()"></button>
  </div>

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
      <tr>
        <td>{{journal.id}}</td>
        <td>{{journal.date}}</td>
        <td>{{journal.totalDebit | currency}}</td>
        <td>{{journal.totalCredit | currency}}</td>
        <td class="flex gap-2">
          <button pButton icon="pi pi-pencil" class="p-button-info" (click)="editJournal(journal)"></button>
          <button pButton icon="pi pi-trash" class="p-button-danger" (click)="deleteJournal(i)"></button>
          <button pButton icon="pi pi-print" class="p-button-warning" (click)="printEntry(journal)"></button>
        </td>
      </tr>
    </ng-template>
  </p-table>

  <!-- Dialog for Add/Edit Entry -->
<p-dialog 
    header="{{isEdit ? 'Edit Entry' : 'New Entry'}}"
    [(visible)]="displayDialog" 
    [modal]="true" 
    [style]="{width:'70vw'}" 
    [closable]="false">

  <!-- Date Picker -->
  <div class="grid gap-4 mb-4">
    <div class="col-6">
      <label class="block mb-1 font-semibold text-gray-700">Date</label>
      <p-datepicker
        [(ngModel)]="currentJournal.date"
        [showIcon]="true"
        [showButtonBar]="true"
        placeholder="Select Date"
        inputId="journalDate"
        class="p-inputtext w-full p-2">
      </p-datepicker>
    </div>

    <div class="col-6 flex items-end">
      <button 
        pButton 
        label="Add Line" 
        icon="pi pi-plus" 
        class="p-button-secondary w-full" 
        (click)="addJournalLine()">
      </button>   
    </div>
  </div>

  <!-- Journal Lines Table -->
  <p-table [value]="currentJournal.entries" class="mb-4">
    <ng-template pTemplate="header">
      <tr>
        <th>Account</th>
        <th>Description</th>
        <th>Debit</th>
        <th>Credit</th>
        <th>Cost Center</th>
        <th>Action</th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-line let-i="rowIndex">
      <tr>
        <td><input type="text" [(ngModel)]="line.account" class="p-inputtext w-full" (keydown)="openAccountSearch($event,i)"></td>
        <td><input type="text" [(ngModel)]="line.description" class="p-inputtext w-full"></td>
        <td><input type="number" min="0" [(ngModel)]="line.debit" (input)="calculateCurrentTotals()" class="p-inputtext w-full"></td>
        <td><input type="number" min="0" [(ngModel)]="line.credit" (input)="calculateCurrentTotals()" class="p-inputtext w-full"></td>
        <td><input type="text" [(ngModel)]="line.costCenter" class="p-inputtext w-full" (keydown)="openCostCenterSearch($event,i)"></td>
        <td>
          <button pButton icon="pi pi-times" class="p-button-danger" (click)="removeJournalLine(i)"></button>
        </td>
      </tr>
    </ng-template>
  </p-table>

  <!-- Totals -->
  <div class="text-right font-bold mt-2">
    Total Debit: {{currentJournal.totalDebit | currency}} | Total Credit: {{currentJournal.totalCredit | currency}}
  </div>

  <!-- Action Buttons -->
  <div class="mt-4 text-right flex gap-2 justify-end">
    <button pButton label="Cancel" icon="pi pi-times" class="p-button-secondary" (click)="displayDialog=false"></button>
    <button pButton label="Print Entry" icon="pi pi-print" class="p-button-warning" (click)="printEntry(currentJournal)"></button>
    <button pButton label="Save" icon="pi pi-check" class="p-button-success" (click)="saveJournal()"></button>
  </div>

</p-dialog>


  <!-- Dialog for Account Selection -->
  <p-dialog header="Select Account" [(visible)]="accountDialog" [modal]="true" [style]="{width:'30vw'}" [closable]="true">
    <ul>
      <li *ngFor="let acc of accounts" (click)="selectAccount(acc)" class="p-2 border-b cursor-pointer hover:bg-gray-200">{{acc}}</li>
    </ul>
  </p-dialog>

  <!-- Dialog for Cost Center Selection -->
  <p-dialog header="Select Cost Center" [(visible)]="costCenterDialog" [modal]="true" [style]="{width:'30vw'}" [closable]="true">
    <ul>
      <li *ngFor="let cc of costCenters" (click)="selectCostCenter(cc)" class="p-2 border-b cursor-pointer hover:bg-gray-200">{{cc}}</li>
    </ul>
  </p-dialog>

  <p-confirmDialog></p-confirmDialog>
</div>
  `
})
export class JournalEntriesComponent {
  journalEntries: any[] = [];
  displayDialog = false;
  isEdit = false;
  currentJournal: any = {id:0, date:'', entries:[], totalDebit:0, totalCredit:0};

  accounts = ['Cash', 'Bank', 'Sales', 'Purchases', 'Expenses'];
  costCenters = ['Main', 'Branch1', 'Branch2', 'ProjectX'];

  accountDialog = false;
  costCenterDialog = false;
  editingRowIndex = 0;
  editingField: 'account' | 'costCenter' = 'account';

  constructor(private messageService: MessageService, private confirmationService: ConfirmationService) {
    this.journalEntries = [
      {id:1, date:'2025-09-24', entries:[{account:'Cash', description:'Opening', debit:1000, credit:0, costCenter:'Main'}], totalDebit:1000, totalCredit:0}
    ];
  }

  openNewJournal(){
    this.isEdit = false;
    this.currentJournal = {id:this.journalEntries.length+1, date:new Date().toISOString().substring(0,10), entries:[], totalDebit:0, totalCredit:0};
    this.displayDialog = true;
  }

  editJournal(journal:any){
    this.isEdit = true;
    this.currentJournal = JSON.parse(JSON.stringify(journal));
    this.displayDialog = true;
  }

  addJournalLine(){
    this.currentJournal.entries.push({account:'', description:'', debit:0, credit:0, costCenter:''});
  }

  removeJournalLine(index:number){
    this.currentJournal.entries.splice(index,1);
    this.calculateCurrentTotals();
  }

  calculateCurrentTotals(){
    this.currentJournal.totalDebit = this.currentJournal.entries.reduce((sum:any,line:any)=>sum+Number(line.debit),0);
    this.currentJournal.totalCredit = this.currentJournal.entries.reduce((sum:any,line:any)=>sum+Number(line.credit),0);
  }

  saveJournal(){
    this.calculateCurrentTotals();
    if(this.currentJournal.totalDebit !== this.currentJournal.totalCredit){
      this.messageService.add({severity:'error', summary:'Error', detail:'Total debit does not equal total credit'});
      return;
    }

    if(this.isEdit){
      const index = this.journalEntries.findIndex(j=>j.id===this.currentJournal.id);
      if(index > -1) this.journalEntries[index] = JSON.parse(JSON.stringify(this.currentJournal));
    } else {
      this.journalEntries.push(JSON.parse(JSON.stringify(this.currentJournal)));
    }

    this.displayDialog = false;
    this.messageService.add({severity:'success', summary:'Saved', detail:'Entry saved successfully'});
  }

  deleteJournal(index:number){
    this.confirmationService.confirm({
      message:'Do you want to delete this entry?',
      header:'Confirm Delete',
      icon:'pi pi-exclamation-triangle',
      accept: ()=>{
        this.journalEntries.splice(index,1);
        this.messageService.add({severity:'info', summary:'Deleted', detail:'Entry deleted successfully'});
      }
    });
  }

  openAccountSearch(event:any,rowIndex:number){
    if(event.key==='F9'){
      this.editingRowIndex = rowIndex;
      this.editingField = 'account';
      this.accountDialog = true;
    }
  }

  openCostCenterSearch(event:any,rowIndex:number){
    if(event.key==='F9'){
      this.editingRowIndex = rowIndex;
      this.editingField = 'costCenter';
      this.costCenterDialog = true;
    }
  }

  selectAccount(acc:string){
    this.currentJournal.entries[this.editingRowIndex].account = acc;
    this.accountDialog = false;
  }

  selectCostCenter(cc:string){
    this.currentJournal.entries[this.editingRowIndex].costCenter = cc;
    this.costCenterDialog = false;
  }

  printEntry(journal:any){
    const lines = journal.entries.map((line:any) => `
      <tr>
        <td>${line.account}</td>
        <td>${line.description}</td>
        <td>${line.debit}</td>
        <td>${line.credit}</td>
        <td>${line.costCenter}</td>
      </tr>
    `).join('');

    const html = `
      <html>
      <head>
        <title>Entry #${journal.id}</title>
        <style>
          table {width:100%; border-collapse: collapse; margin-bottom:10px;}
          th, td {border: 1px solid #000; padding: 5px; text-align: left;}
          th {background: #eee;}
        </style>
      </head>
      <body>
        <h2>Entry #${journal.id} - ${journal.date}</h2>
        <table>
          <tr>
            <th>Account</th><th>Description</th><th>Debit</th><th>Credit</th><th>Cost Center</th>
          </tr>
          ${lines}
          <tr>
            <td colspan="2" style="text-align:right"><strong>Total:</strong></td>
            <td>${journal.totalDebit}</td>
            <td>${journal.totalCredit}</td>
            <td></td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const newWindow = window.open('', '_blank');
    newWindow?.document.write(html);
    newWindow?.document.close();
    newWindow?.print();
  }
}
