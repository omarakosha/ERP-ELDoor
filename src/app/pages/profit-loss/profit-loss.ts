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
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface ProfitLossEntry {
  account: string;
  type: 'Revenue' | 'Expense';
  amount: number;
  date: string;
}

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
  <p-toast></p-toast>
  <h2 class="text-3xl font-bold mb-6">Profit & Loss Statement - الربح والخسارة</h2>

 
  <div class="flex gap-4 mb-4 flex-wrap">
    <!-- فلترة التواريخ -->
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

    <!-- فلترة النوع -->
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
        <td>{{row.amount | currency}}</td>
        <td>{{row.date}}</td>
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

  entries: ProfitLossEntry[] = [
    {account: 'Sales', type: 'Revenue', amount: 5000, date: '2025-09-01'},
    {account: 'Service Income', type: 'Revenue', amount: 2000, date: '2025-09-10'},
    {account: 'Rent', type: 'Expense', amount: 1000, date: '2025-09-05'},
    {account: 'Utilities', type: 'Expense', amount: 300, date: '2025-09-15'},
  ];

  filteredData: ProfitLossEntry[] = [...this.entries];
  startDate: string | null = null;
  endDate: string | null = null;

  typeOptions: MultiSelectOption[] = [
    {label: 'Revenue', value: 'Revenue'},
    {label: 'Expense', value: 'Expense'}
  ];
  selectedTypes: MultiSelectOption[] = [];

  constructor(private messageService: MessageService) {}

  get totalRevenue() {
    return this.filteredData.filter(e => e.type==='Revenue').reduce((sum,e)=>sum+e.amount,0);
  }

  get totalExpenses() {
    return this.filteredData.filter(e => e.type==='Expense').reduce((sum,e)=>sum+e.amount,0);
  }

  get netProfit() {
    return this.totalRevenue - this.totalExpenses;
  }

  applyFilter() {
    const selectedValues = this.selectedTypes.map(t => t.value);

    this.filteredData = this.entries.filter(e => {
      const entryDate = new Date(e.date);
      const afterStart = this.startDate ? entryDate >= new Date(this.startDate) : true;
      const beforeEnd = this.endDate ? entryDate <= new Date(this.endDate) : true;
      const typeMatch = !selectedValues.length || selectedValues.includes(e.type);
      return afterStart && beforeEnd && typeMatch;
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
      this.messageService.add({severity:'warn', summary:'Export', detail:'No data to export'});
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(this.filteredData);
    const workbook = { Sheets: { 'ProfitLoss': worksheet }, SheetNames: ['ProfitLoss'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'ProfitLoss.xlsx');
  }

}
