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
  <h2 class="text-3xl font-bold mb-6">Journal Entries - قيود اليومية</h2>

  <div class="flex justify-between items-center mb-4">
    <button pButton label="New Entry" icon="pi pi-plus" class="p-button-success" (click)="openNewJournal()"></button>
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
      <tr>
        <td>{{journal.id}}</td>
        <td>{{journal.date}}</td>
        <td>{{journal.totalDebit | number:'1.2-2'}}</td>
        <td>{{journal.totalCredit | number:'1.2-2'}}</td>
        <td class="flex gap-2">
          <button pButton icon="pi pi-pencil" class="p-button-info p-button-sm" (click)="editJournal(journal)"></button>
          <button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" (click)="deleteJournal(i)"></button>
          <button pButton icon="pi pi-print" class="p-button-warning p-button-sm" (click)="printEntry(journal)"></button>
        </td>
      </tr>
    </ng-template>
  </p-table>

  <!-- Dialog إضافة/تعديل القيد -->
  <p-dialog header="{{isEdit ? 'Edit Entry' : 'New Entry'}}"
            [(visible)]="displayDialog"
            [modal]="true"
            [style]="{width:'90vw'}"
            [closable]="false">

    <!-- رقم القيد + التاريخ -->
    <div class="grid gap-4 mb-4">
      <div class="col-6">
        <label class="block mb-1 font-semibold">Entry No.</label>
        <input type="text" [(ngModel)]="currentJournal.id" class="p-inputtext w-full bg-gray-100" readonly>
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
          <th>Account</th>
          <th>Description</th>
          <th>Debit</th>
          <th>Credit</th>
          <th>Cost Center</th>
          <th>Tags</th>
          <th>Action</th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-line let-i="rowIndex">
        <tr [ngClass]="{'bg-green-100':line.debit===line.credit, 'bg-red-100':line.debit!==line.credit}" 
            (click)="selectedRowIndex=i">
          <td><input type="text" [(ngModel)]="line.account" (keydown)="openAccountSearch($event,i)" class="p-inputtext w-full"></td>
          <td><input type="text" [(ngModel)]="line.description" class="p-inputtext w-full"></td>
          <td><input type="number" [(ngModel)]="line.debit" min="0" (input)="calculateCurrentTotals()" class="p-inputtext w-full text-right"></td>
          <td><input type="number" [(ngModel)]="line.credit" min="0" (input)="calculateCurrentTotals()" class="p-inputtext w-full text-right"></td>
          <td><input type="text" [(ngModel)]="line.costCenter" (keydown)="openCostCenterSearch($event,i)" class="p-inputtext w-full"></td>
          <td>
            <p-multiSelect [options]="tags" [(ngModel)]="line.tags" optionLabel="name" display="chip" defaultLabel="Select tags" [filter]="true"></p-multiSelect>
          </td>
          <td>
            <button pButton icon="pi pi-times" class="p-button-rounded p-button-danger p-button-sm" (click)="removeJournalLine(i)"></button>
          </td>
        </tr>
      </ng-template>
    </p-table>

    <p-contextMenu #cm [model]="contextMenuItems"></p-contextMenu>

    <div *ngIf="currentJournal.totalDebit !== currentJournal.totalCredit" class="text-red-600 font-bold text-right">
      ⚠️ Debit and Credit must be equal
    </div>

    <!-- مجموع لكل Tag -->
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
      <button pButton label="Cancel" icon="pi pi-times" class="p-button-secondary" (click)="displayDialog=false"></button>
      <button pButton label="Save" icon="pi pi-check" class="p-button-success" (click)="saveJournal()"></button>
    </div>
  </p-dialog>

  <!-- Dialog لاختيار الحساب -->
  <p-dialog header="Select Account" [(visible)]="accountDialog" [modal]="true" [style]="{width:'40vw'}">
    <input type="text" pInputText [(ngModel)]="accountFilter" placeholder="Search account..." class="w-full mb-2">
    <p-table [value]="filteredAccounts()" [paginator]="true" [rows]="5">
      <ng-template pTemplate="body" let-acc>
        <tr (click)="selectAccount(acc)" class="cursor-pointer hover:bg-gray-200">
          <td>{{acc}}</td>
        </tr>
      </ng-template>
    </p-table>
  </p-dialog>

  <!-- Dialog لاختيار مركز التكلفة -->
  <p-dialog header="Select Cost Center" [(visible)]="costCenterDialog" [modal]="true" [style]="{width:'40vw'}">
    <input type="text" pInputText [(ngModel)]="costCenterFilter" placeholder="Search cost center..." class="w-full mb-2">
    <p-table [value]="filteredCostCenters()" [paginator]="true" [rows]="5">
      <ng-template pTemplate="body" let-cc>
        <tr (click)="selectCostCenter(cc)" class="cursor-pointer hover:bg-gray-200">
          <td>{{cc}}</td>
        </tr>
      </ng-template>
    </p-table>
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
  tags = [{name:'Urgent'}, {name:'Internal'}, {name:'External'}, {name:'Follow-up'}];

  accountDialog = false;
  costCenterDialog = false;
  accountFilter = '';
  costCenterFilter = '';
  editingRowIndex = 0;
  editingField: 'account' | 'costCenter' = 'account';

  selectedRowIndex = -1;
  selectedLine: any = null;
  copiedLine: any = null;

  undoStack: any[] = [];
  redoStack: any[] = [];

  contextMenuItems = [
    {label:'Copy Line', icon:'pi pi-copy', command:()=>this.copyLine()},
    {label:'Paste Line', icon:'pi pi-clone', command:()=>this.pasteLine()},
    {label:'Delete Line', icon:'pi pi-trash', command:()=>this.removeJournalLine(this.selectedRowIndex)}
  ];

  constructor(private messageService: MessageService, private confirmationService: ConfirmationService) {
    this.journalEntries = [
      {id:1, date:new Date().toISOString().substring(0,10), entries:[{account:'Cash', description:'Opening', debit:1000, credit:0, costCenter:'Main', tags:['Internal'] }], totalDebit:1000, totalCredit:0}
    ];
  }

  // إضافة / تعديل / حذف / نسخ / لصق
  openNewJournal(){ this.isEdit=false; this.currentJournal={id:this.journalEntries.length+1,date:new Date().toISOString().substring(0,10),entries:[{account:'',description:'',debit:0,credit:0,costCenter:'',tags:[]}],totalDebit:0,totalCredit:0}; this.displayDialog=true; }
  editJournal(journal:any){ this.isEdit=true; this.currentJournal=JSON.parse(JSON.stringify(journal)); this.displayDialog=true; }
  addJournalLine(){ this.currentJournal.entries.push({account:'',description:'',debit:0,credit:0,costCenter:'',tags:[]}); this.pushUndo(); }
  removeJournalLine(index:number){ if(index>=0){ this.currentJournal.entries.splice(index,1); this.calculateCurrentTotals(); this.pushUndo(); } }
  calculateCurrentTotals(){ this.currentJournal.totalDebit=this.currentJournal.entries.reduce((sum:any,line:any)=>sum+Number(line.debit||0),0); this.currentJournal.totalCredit=this.currentJournal.entries.reduce((sum:any,line:any)=>sum+Number(line.credit||0),0); }
  saveJournal(){ this.calculateCurrentTotals(); if(this.currentJournal.totalDebit!==this.currentJournal.totalCredit){ this.messageService.add({severity:'error',summary:'Error',detail:'Total debit does not equal total credit'}); return; } if(this.isEdit){ const index=this.journalEntries.findIndex(j=>j.id===this.currentJournal.id); if(index>-1) this.journalEntries[index]=JSON.parse(JSON.stringify(this.currentJournal)); }else{ this.journalEntries.push(JSON.parse(JSON.stringify(this.currentJournal))); } this.displayDialog=false; this.messageService.add({severity:'success',summary:'Saved',detail:'Entry saved successfully'}); }
  deleteJournal(index:number){ this.confirmationService.confirm({message:'Do you want to delete this entry?',header:'Confirm Delete',icon:'pi pi-exclamation-triangle',accept:()=>{this.journalEntries.splice(index,1); this.messageService.add({severity:'info',summary:'Deleted',detail:'Entry deleted successfully'});}}); }

  openAccountSearch(event:any,rowIndex:number){ if(event.key==='F9'){this.editingRowIndex=rowIndex;this.editingField='account';this.accountDialog=true;} else if(event.key==='Enter' && rowIndex===this.currentJournal.entries.length-1){this.addJournalLine();} }
  openCostCenterSearch(event:any,rowIndex:number){ if(event.key==='F9'){this.editingRowIndex=rowIndex;this.editingField='costCenter';this.costCenterDialog=true;} else if(event.key==='Enter' && rowIndex===this.currentJournal.entries.length-1){this.addJournalLine();} }

  selectAccount(acc:string){ this.currentJournal.entries[this.editingRowIndex].account=acc; this.accountDialog=false; }
  selectCostCenter(cc:string){ this.currentJournal.entries[this.editingRowIndex].costCenter=cc; this.costCenterDialog=false; }

  filteredAccounts(){ return this.accounts.filter(a=>a.toLowerCase().includes(this.accountFilter.toLowerCase())); }
  filteredCostCenters(){ return this.costCenters.filter(c=>c.toLowerCase().includes(this.costCenterFilter.toLowerCase())); }

  copyLine(){ if(this.selectedRowIndex>=0){ this.copiedLine={...this.currentJournal.entries[this.selectedRowIndex]}; this.messageService.add({severity:'info',summary:'Copied',detail:'Line copied'}); } }
  pasteLine(){ if(this.copiedLine){ this.currentJournal.entries.splice(this.selectedRowIndex+1,0,{...this.copiedLine}); this.messageService.add({severity:'success',summary:'Pasted',detail:'Line pasted'}); this.calculateCurrentTotals(); this.pushUndo(); } }

  // Undo / Redo
  pushUndo(){ this.undoStack.push(JSON.stringify(this.currentJournal.entries)); if(this.undoStack.length>50) this.undoStack.shift(); }
  undo(){ if(this.undoStack.length>0){ this.redoStack.push(JSON.stringify(this.currentJournal.entries)); this.currentJournal.entries=JSON.parse(this.undoStack.pop()!); this.calculateCurrentTotals(); } }
  redo(){ if(this.redoStack.length>0){ this.undoStack.push(JSON.stringify(this.currentJournal.entries)); this.currentJournal.entries=JSON.parse(this.redoStack.pop()!); this.calculateCurrentTotals(); } }

  calculateTagTotal(tagName:string){ return this.currentJournal.entries.filter((l:any)=>l.tags?.includes(tagName)).reduce((sum:any,l:any)=>sum+(Number(l.debit||0)+Number(l.credit||0)),0); }

  @HostListener('document:keydown',['$event'])
  handleKeyboard(event:KeyboardEvent){
    const key=event.key.toLowerCase();
    if(event.ctrlKey){
      switch(key){
        case 'c': case 'ؤ': this.copyLine(); event.preventDefault(); break;
        case 'v': case 'ر': this.pasteLine(); event.preventDefault(); break;
        case 'x': case 'ء': this.copyLine(); this.removeJournalLine(this.selectedRowIndex); event.preventDefault(); break;
        case 'z': case 'ئ': this.undo(); event.preventDefault(); break;
        case 'y': case 'غ': this.redo(); event.preventDefault(); break;
      }
    } else if(key==='delete' && this.selectedRowIndex>=0){ this.removeJournalLine(this.selectedRowIndex); event.preventDefault(); }
  }

  printEntry(journal:any){
    const lines = journal.entries.map((line:any)=>`
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
    const newWindow=window.open('','_blank'); newWindow?.document.write(html); newWindow?.document.close(); newWindow?.print();
  }
}
