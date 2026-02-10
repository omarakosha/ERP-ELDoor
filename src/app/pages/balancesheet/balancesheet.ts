import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TrialBalanceService, BalanceSheetEntry, BalanceSheetResponse } from '@/apiservice/trialbalance.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { LoaderService } from '@/apiservice/loading.service';

@Component({
  selector: 'app-balance-sheet',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
<div class="card" style=" min-height: 70vh">

   <p-toast position="top-center" class="custom-toast"></p-toast>

<!-- Header Row -->
<div class="flex items-center justify-between mt-6 flex-wrap gap-3">
  <!-- Buttons -->
  <div>
    <button
      pButton
      label="Export Excel"
      icon="pi pi-file-excel"
      class="p-button-success p-button-sm"
      (click)="exportExcel()" outlined>
    </button>
  </div>

</div>

<!-- Summary Card - Compact -->
<div class="mt-2 mb-15 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md dark:shadow-gray-900 transition-all">

  <!-- Summary Boxes -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

    <!-- Assets -->
    <div class="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition">
      <div class="p-2 bg-blue-100 dark:bg-blue-600 text-blue-700 dark:text-white rounded-full">
        <i class="pi pi-briefcase text-xl"></i>
      </div>
      <div>
        <p class="text-gray-600 dark:text-gray-300 text-xs">Total Assets</p>
        <p class="text-xl font-bold text-blue-600 dark:text-blue-300">
          {{ totalAssets | number:'1.2-2' }}
        </p>
      </div>
    </div>

    <!-- Liabilities -->
    <div class="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition">
      <div class="p-2 bg-yellow-100 dark:bg-yellow-600 text-yellow-700 dark:text-white rounded-full">
        <i class="pi pi-exclamation-triangle text-xl"></i>
      </div>
      <div>
        <p class="text-gray-600 dark:text-gray-300 text-xs">Total Liabilities</p>
        <p class="text-xl font-bold text-yellow-600 dark:text-yellow-300">
          {{ totalLiabilities | number:'1.2-2' }}
        </p>
      </div>
    </div>

    <!-- Equity -->
    <div class="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition">
      <div class="p-2 bg-purple-100 dark:bg-purple-600 text-purple-700 dark:text-white rounded-full">
        <i class="pi pi-chart-line text-xl"></i>
      </div>
      <div>
        <p class="text-gray-600 dark:text-gray-300 text-xs">Total Equity</p>
        <p class="text-xl font-bold text-purple-600 dark:text-purple-300">
          {{ totalEquity | number:'1.2-2' }}
        </p>
      </div>
    </div>

  </div>

  <!-- Balance Check -->
  <div class="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm flex items-center gap-3"
       [ngClass]="{
          'border border-green-500': check === 0,
          'border border-red-500': check !== 0
       }">

      <div class="p-2 rounded-full"
          [ngClass]="{
            'bg-green-100 text-green-700 dark:bg-green-600 dark:text-white': check === 0,
            'bg-red-100 text-red-700 dark:bg-red-600 dark:text-white': check !== 0
          }">
        <i class="pi"
           [ngClass]="{
             'pi-check-circle': check === 0,
             'pi-times-circle': check !== 0
           }"
           class="text-xl">
        </i>
      </div>

      <div>
        <p class="text-gray-600 dark:text-gray-300 text-xs">Balance Check</p>
        <p class="text-xl font-bold"
           [ngClass]="{
             'text-green-600 dark:text-green-300': check === 0,
             'text-red-600 dark:text-red-300': check !== 0
           }">
          {{ check | number:'1.2-2' }}
        </p>
      </div>

  </div>

</div>


  <!-- Table -->
  <div class="overflow-hidden rounded-lg shadow-md dark:shadow-gray-700">
    <p-table
      [value]="accounts"
      [paginator]="true"
      [rows]="15"
      responsiveLayout="scroll"
      class="text-sm">

      <ng-template pTemplate="header">
        <tr class="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100">
          <th class="p-3">Account</th>
          <th class="p-3">Type</th>
          <th class="p-3">Debit</th>
          <th class="p-3">Credit</th>
          <th class="p-3">Balance</th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-row>
        <tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
          <td class="p-3">{{row.account}}</td>
          <td class="p-3">{{row.type}}</td>
          <td class="p-3">{{row.debit | number:'1.2-2'}}</td>
          <td class="p-3">{{row.credit | number:'1.2-2'}}</td>
          <td class="p-3 font-semibold"
              [ngClass]="{
                'text-green-600': row.balance >= 0,
                'text-red-500': row.balance < 0
              }">
              {{row.balance | number:'1.2-2'}}
          </td>
        </tr>
      </ng-template>

    </p-table>
  </div>





</div>

  `
})
export class BalanceSheetComponent {
  accounts: BalanceSheetEntry[] = [];

  totalAssets = 0;
  totalLiabilities = 0;
  totalEquity = 0;
  check = 0;

  constructor(private service: TrialBalanceService, private msg: MessageService, public loaderService: LoaderService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
     this.loaderService.show(); // 🟢 تشغيل اللودنق قبل الطلب
    this.service.getBalanceSheet().subscribe({
      next: (res: BalanceSheetResponse) => {
        this.accounts = res.accounts;
        this.totalAssets = res.totalAssets;
        this.totalLiabilities = res.totalLiabilities;
        this.totalEquity = res.totalEquity;
        this.check = res.check;
          this.loaderService.hide(); // 🟢 إيقاف اللودنق عند الخطأ
      },
        error: (err) => {
      console.error('Failed to load journals', err);
      this.loaderService.hide(); // 🟢 إيقاف اللودنق عند الخطأ
      this.msg.add({
        severity: 'error',
        summary: 'Error',
        detail: '  Internal Server Error Code 500'
      });
    }
    });
  }

  exportExcel() {
    if (!this.accounts.length) {
      this.msg.add({ severity: 'warn', summary: 'Export', detail: 'No data to export' });
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(this.accounts);
    const workbook = { Sheets: { 'BalanceSheet': worksheet }, SheetNames: ['BalanceSheet'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), 'BalanceSheet.xlsx');
  }
}
