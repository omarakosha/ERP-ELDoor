import { Component, OnInit, ViewChild,HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { InputGroupModule } from 'primeng/inputgroup';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';
import { DialogModule } from 'primeng/dialog';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';

interface Account {
  id: number;
  name: string;
  parentId?: number;
}

interface CostCenter {
  label: string;
  value: string;
  selected?: boolean;
}


interface Transaction {
  id: number;
  accountNumber: string;
  accountName: string;
  date: Date;
  type: 'مدين' | 'دائن';
  amount: number;
  balance: number;
  costCenter?: string;
  project?: string;
  description?: string;
  currency?: string;
}

@Component({
  selector: 'app-financial-report',
  standalone: true,
   schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    RippleModule,
    SelectModule,
    DatePickerModule,
    InputGroupModule,
    TagModule,
    TooltipModule,
    ChartModule,
    AccordionModule,
    DialogModule
  ],
  templateUrl: './financial-report.component.html',
  providers: [MessageService,]
})
export class FinancialReportComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  loading = false;

  financialYears = [{ label: '2023', value: 2023 }, { label: '2024', value: 2024 }, { label: '2025', value: 2025 }];
  transactionTypes = [{ label: 'مدين', value: 'مدين' }, { label: 'دائن', value: 'دائن' }];
  currencies = [{ label: 'SAR', value: 'SAR' }, { label: 'USD', value: 'USD' }];

  parentAccounts: Account[] = [];
  childAccounts: Account[] = [];
  selectedParentAccount?: number;
  selectedChildAccount?: number;

  costCenters: CostCenter[] = [
    { label: 'التصنيع', value: 'التصنيع' },
    { label: 'المبيعات', value: 'المبيعات' }
  ];

  
  selectedReport: string | undefined;
  showChart = false;
  chartData: any;
  chartOptions: any;

  displayDialog = false;
  displayAccountDialog = false;
  displayCostCenterDialog = false;
  selectedTransaction: Transaction | null = null;

  filterData = {
    startDate: null as Date | null,
    endDate: null as Date | null,
    accountNumber: '',
    financialYear: null as number | null,
    transactionType: null as 'مدين' | 'دائن' | null,
    costCenter: null as string | null,
    project: null as string | null,
    currency: null as string | null
  };

  totalDebit = 0;
  totalCredit = 0;
  finalBalance = 0;
  avgTransaction = 0;

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    // بيانات تجريبية
    this.transactions = [
      { id:1, accountNumber: '1001', accountName: 'الصندوق', date: new Date('2025-01-10'), type: 'مدين', amount: 2000, balance: 2000, costCenter: 'التصنيع', project: 'مشروع 1', description: 'إيداع نقدي', currency: 'SAR' },
      { id:2, accountNumber: '1001', accountName: 'الصندوق', date: new Date('2025-02-10'), type: 'دائن', amount: 500, balance: 1500, costCenter: 'المبيعات', project: 'مشروع 2', description: 'سحب نقدي', currency: 'SAR' },
      { id:3, accountNumber: '2001', accountName: 'البنك', date: new Date('2025-03-01'), type: 'مدين', amount: 3000, balance: 4500, costCenter: 'التصنيع', project: 'مشروع 1', description: 'تحويل بنكي', currency: 'USD' },
      { id:4, accountNumber: '2001', accountName: 'البنك', date: new Date('2025-04-01'), type: 'دائن', amount: 1000, balance: 3500, costCenter: 'المبيعات', project: 'مشروع 3', description: 'دفعة', currency: 'USD' },
    ];

    // إعداد الحسابات الأب/الابن
    this.parentAccounts = [
      { id: 1, name: 'الموردين' },
      { id: 2, name: 'العملاء' }
    ];
    this.childAccounts = [
      { id: 101, name: 'مورد 1', parentId: 1 },
      { id: 102, name: 'مورد 2', parentId: 1 },
      { id: 201, name: 'عميل 1', parentId: 2 }
    ];

    this.filteredTransactions = [...this.transactions];
    this.calculateTotals();
  }

  filterReport() {
    let selectedCostCenters = this.costCenters.filter(c => c.selected).map(c => c.value);
    this.filteredTransactions = this.transactions.filter(t => {
      const matchDate =
        (!this.filterData.startDate || new Date(t.date) >= new Date(this.filterData.startDate)) &&
        (!this.filterData.endDate || new Date(t.date) <= new Date(this.filterData.endDate));
      const matchAccount = !this.selectedChildAccount || t.accountNumber === this.getChildAccountNumber(this.selectedChildAccount);
      const matchYear = !this.filterData.financialYear || t.date.getFullYear() === this.filterData.financialYear;
      const matchType = !this.filterData.transactionType || t.type === this.filterData.transactionType;
      const matchCostCenter = selectedCostCenters.length===0 || selectedCostCenters.includes(t.costCenter!);
      const matchProject = !this.filterData.project || t.project?.includes(this.filterData.project);
      const matchCurrency = !this.filterData.currency || t.currency === this.filterData.currency;
      return matchDate && matchAccount && matchYear && matchType && matchCostCenter && matchProject && matchCurrency;
    });
    this.calculateTotals();
  }

  calculateTotals() {
    this.totalDebit = this.filteredTransactions.filter(t => t.type === 'مدين').reduce((sum, t) => sum + t.amount, 0);
    this.totalCredit = this.filteredTransactions.filter(t => t.type === 'دائن').reduce((sum, t) => sum + t.amount, 0);
    this.finalBalance = this.totalDebit - this.totalCredit;
    this.avgTransaction = this.filteredTransactions.length ? this.filteredTransactions.reduce((sum, t) => sum + t.amount, 0) / this.filteredTransactions.length : 0;
  }

  clearFilters() {
    this.filterData = {
      startDate: null,
      endDate: null,
      accountNumber: '',
      financialYear: null,
      transactionType: null,
      costCenter: null,
      project: null,
      currency: null
    };
    this.selectedParentAccount = undefined;
    this.selectedChildAccount = undefined;
    this.costCenters.forEach(c => c.selected = false);
    this.filteredTransactions = [...this.transactions];
    this.calculateTotals();
  }

  onGlobalFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dt.filterGlobal(input.value, 'contains');
  }

  onRowSelect(tx: Transaction | Transaction[] | null | undefined) {
    if (!tx) return;
    this.selectedTransaction = Array.isArray(tx) ? tx[0] : tx;
    this.displayDialog = true;
  }

  // F9 لاختيار الحساب
  @HostListener('document:keydown.f9', ['$event'])
  onF9Press(event: KeyboardEvent) {
    event.preventDefault();
    this.displayAccountDialog = true;
  }

  loadChildAccounts() {
    this.childAccounts = [
      { id: 101, name: 'مورد 1', parentId: 1 },
      { id: 102, name: 'مورد 2', parentId: 1 },
      { id: 201, name: 'عميل 1', parentId: 2 }
    ].filter(c => c.parentId === this.selectedParentAccount);
  }

  applyAccountFilter() {
    this.displayAccountDialog = false;
  }

  applyCostCenterFilter() {
    this.displayCostCenterDialog = false;
  }

  getChildAccountNumber(childId: number) {
    const child = this.childAccounts.find(c => c.id === childId);
    return child ? child.name.includes('مورد') ? '1001' : '2001' : '';
  }

exportToPDF() {
  const doc = new jsPDF('p', 'mm', 'a4');

  // عنوان التقرير على يمين الصفحة
  const title = 'تقرير الحركات المالية';
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text(title, 200 - 14, 10, { align: 'right' });

  // تجهيز بيانات الجدول
  const bodyData = this.filteredTransactions.map(x => [
    x.accountNumber || '',
    x.accountName || '',
    x.date ? x.date.toLocaleDateString('ar-EG') : '',
    x.type || '',
    x.amount?.toFixed(2) || '0.00',
    x.balance?.toFixed(2) || '0.00',
    x.costCenter || '',
    x.project || '',
    x.description || '',
    x.currency || ''
  ]);

  // جدول مع دعم RTL عبر محاذاة النصوص لليمين
  autoTable(doc, {
    head: [['رقم الحساب','اسم الحساب','التاريخ','نوع الحركة','المبلغ','الرصيد','مركز التكلفة','المشروع','الوصف','العملة']],
    body: bodyData,
    startY: 20,
    styles: { halign: 'right', font: 'helvetica' }, // محاذاة المحتوى لليمين
    headStyles: { halign: 'center', fillColor: [41, 128, 185], textColor: 255 },
    theme: 'grid'
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 20;

  // المجاميع على يمين الصفحة
  doc.text(`إجمالي المدين: ${this.totalDebit.toFixed(2)}`, 200 - 14, finalY + 10, { align: 'right' });
  doc.text(`إجمالي الدائن: ${this.totalCredit.toFixed(2)}`, 200 - 14, finalY + 20, { align: 'right' });
  doc.text(`الرصيد النهائي: ${this.finalBalance.toFixed(2)}`, 200 - 14, finalY + 30, { align: 'right' });

  doc.save('financial-report.pdf');
}

  exportExcel() {
    const worksheet = XLSX.utils.json_to_sheet(this.filteredTransactions);
    const workbook = { Sheets: { 'تقرير الحركات': worksheet }, SheetNames: ['تقرير الحركات'] };
    XLSX.writeFile(workbook, 'financial-report.xlsx');
  }

  exportCSV() {
    const worksheet = XLSX.utils.json_to_sheet(this.filteredTransactions);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'financial-report.csv';
    link.click();
  }
}
