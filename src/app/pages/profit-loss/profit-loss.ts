import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { TrialBalanceService, ProfitLossEntry, ProfitLossResponse } from '@/apiservice/trialbalance.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { LoaderService } from '@/apiservice/loading.service';

interface MultiSelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-profit-loss',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    TableModule,
    ButtonModule,
    ToastModule,
    DatePickerModule,
    MultiSelectModule
  ],
  providers: [MessageService],
  template: `
<div class="card">
     <p-toast position="top-center" class="custom-toast"></p-toast>
  <h2 class="text-3xl font-bold mb-6">Profit & Loss Statement</h2>

  <div class="flex gap-4 mb-4 flex-wrap">
    <p-datepicker
        [(ngModel)]="startDate"
        [showIcon]="true"
        [showButtonBar]="true"
        placeholder="Start Date"
        (onSelect)="applyFilter()">
    </p-datepicker>

    <p-datepicker
        [(ngModel)]="endDate"
        [showIcon]="true"
        [showButtonBar]="true"
        placeholder="End Date"
        (onSelect)="applyFilter()">
    </p-datepicker>

    <p-multiSelect
      [options]="typeOptions"
      [(ngModel)]="selectedTypes"
      optionLabel="label"
      placeholder="Filter by Type"
      (onChange)="applyFilter()"
      display="chip">
    </p-multiSelect>

    <button pButton label="Reset" icon="pi pi-refresh" class="p-button-secondary" (click)="resetFilter()"></button>
    <button pButton label="Export Excel" icon="pi pi-file-excel" class="p-button-success" (click)="exportExcel()"></button>
  </div>

  <p-table [value]="filteredData" [paginator]="true" [rows]="10" [responsiveLayout]="'scroll'">
    <ng-template pTemplate="header">
      <tr>
        <th>Account</th>
        <th>Type</th>
        <th>Amount</th>
        <th>Date</th>
      </tr>
    </ng-template>

    <ng-template pTemplate="body" let-row>
      <tr [ngClass]="{'bg-green-100': row.type==='Revenue','bg-red-100': row.type==='Expense'}">
        <td>{{row.account}}</td>
        <td>{{row.type}}</td>
        <td>{{row.totalCredit - row.totalDebit | currency}}</td>
        <td>{{row.entries[0]?.date | date:'yyyy-MM-dd'}}</td>
        
      </tr>
    </ng-template>

    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="4" class="text-center text-gray-500">No entries found for selected filters.</td>
      </tr>
    </ng-template>

    <ng-template pTemplate="footer">
      <tr>
        <td colspan="2" class="font-bold">Total Revenue</td>
        <td>{{totalRevenue | currency}}</td>
        <td></td>
      </tr>
      <tr>
        <td colspan="2" class="font-bold">Total Expenses</td>
        <td>{{totalExpenses | currency}}</td>
        <td></td>
      </tr>
      <tr>
        <td colspan="2" class="font-bold">Net Profit / Loss</td>
        <td [ngClass]="{'text-green-600': netProfit>=0,'text-red-600': netProfit<0}">{{netProfit | currency}}</td>
        <td></td>
      </tr>
    </ng-template>
  </p-table>
</div>
  `
})
export class ProfitLossComponent {
    loading: boolean = false;
  entries: ProfitLossEntry[] = [];
  filteredData: ProfitLossEntry[] = [];
  startDate: string | null = null;
  endDate: string | null = null;
  selectedTypes: string[] = [];

  totalRevenue = 0;
  totalExpenses = 0;
  netProfit = 0;

  typeOptions: MultiSelectOption[] = [
    {label: 'Revenue', value: 'Revenue'},
    {label: 'Expense', value: 'Expense'},
    
  ];

  constructor(
    private service: TrialBalanceService,
    private messageService: MessageService, 
    public loaderService: LoaderService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loaderService.show(); // 🟢 تشغيل اللودنق قبل الطلب
    this.service.getProfitLoss().subscribe({
      next: (res: ProfitLossResponse) => {
        this.entries = res.accounts;
        this.filteredData = [...this.entries];
        this.totalRevenue = res.totalRevenue;
        this.totalExpenses = res.totalExpense;
        this.netProfit = res.netProfit;
         this.loaderService.hide(); // 🟢 إيقاف اللودنق عند الخطأ
      },
      
      
       error: (err) => {
      console.error('Failed to load journals', err);
      this.loaderService.hide(); // 🟢 إيقاف اللودنق عند الخطأ
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: '  Internal Server Error Code 500'
      });
    }
    });
  }

  applyFilter() {
    const afterStart = this.startDate ? new Date(this.startDate) : null;
    const beforeEnd = this.endDate ? new Date(this.endDate) : null;

    this.filteredData = this.entries.filter(e => {
      const dateMatch = e.entries.some((en: ProfitLossEntry['entries'][0]) => {
        const d = new Date(en.date);
        return (!afterStart || d >= afterStart) && (!beforeEnd || d <= beforeEnd);
      });
      const typeMatch = !this.selectedTypes.length || this.selectedTypes.includes(e.type);
      return dateMatch && typeMatch;
    });
  }

  resetFilter() {
    this.startDate = null;
    this.endDate = null;
    this.selectedTypes = [];
    this.filteredData = [...this.entries];
  }

  exportExcel() {
    if (!this.filteredData.length) {
      this.messageService.clear();
      this.messageService.add({severity:'warn', summary:'Export', detail:'No data to export'});
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(this.filteredData.map(e => ({
      Account: e.account,
      Type: e.type,
      Amount: e.totalCredit - e.totalDebit,
      Date: e.entries[0]?.date
    })));
    const workbook = { Sheets: { 'ProfitLoss': worksheet }, SheetNames: ['ProfitLoss'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'ProfitLoss.xlsx');
  }
}
