import { Component, OnInit, ViewChild, HostListener, CUSTOM_ELEMENTS_SCHEMA, ElementRef } from '@angular/core';
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
import { AccordionModule } from 'primeng/accordion';
import { HttpErrorResponse } from '@angular/common/http';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

import { EntitiesService, JournalEntryDto } from '@/apiservice/Entities.service';
import { AccountsService } from '@/apiservice/accounts.service';

interface Account {
  id: number;
  type?: string;
  name: string;
  code?: string;
  parentId?: number;
  children?: Account[];
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
  costCenterId?: number;
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
    CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule,
    ToastModule, RippleModule, SelectModule, DatePickerModule, InputGroupModule,
    TagModule, TooltipModule, ChartModule, AccordionModule, DialogModule
  ],
  templateUrl: './financial-report.component.html',
  providers: [MessageService]
})
export class FinancialReportComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  @ViewChild('mainAccountInput') mainAccountInput!: ElementRef;
@ViewChild('subAccountInput') subAccountInput!: ElementRef;
@ViewChild('costFromInput') costFromInput!: ElementRef;
@ViewChild('costToInput') costToInput!: ElementRef;


  filteredAccountsList: Account[] = [];
  allParentAccounts: Account[] = []; // نسخة أصلية
  selectedCostCenterNameFrom: string | null = null;
  selectedCostCenterNameTo: string | null = null;
  // تعريف البيانات الخاصة بتقرير مراكز التكلفة
  costCenterReportData: {
    name: string;
    totalDebit: number;
    totalCredit: number;
    balance: number
  }[] = [];
  costCenters: CostCenter[] = [];

  // مركز التكلفة المحدد (واحد أو متعدد مستقبلاً)
  selectedCostCenter: Account | null = null;

  // الحركات الخاصة بمركز التكلفة
  journalEntries: JournalEntryDto[] = [];


  accounts: Account[] = [];

  accountFilter = '';
  filteredParentAccounts: Account[] = [];
  costCenterDialog = false;
  childCostCenters: Account[] = [];
  costCenterFilter: string = '';
  filteredCostCentersList: Account[] = [];
  childAccounts: Account[] = [];

  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  loading = false;

  financialYears = [{ label: '2023', value: 2023 }, { label: '2024', value: 2024 }, { label: '2025', value: 2025 }];
  transactionTypes = [{ label: 'مدين', value: 'مدين' }, { label: 'دائن', value: 'دائن' }];
  currencies = [{ label: 'SAR', value: 'SAR' }, { label: 'USD', value: 'USD' }];

  parentAccounts: Account[] = [];
  selectedParentAccount?: Account;
  selectedEntity?: { id: number, name: string };
  displayDialog = false;
  displayAccountDialog = false;
  selectedTransaction: Transaction | null = null;

  filterData = {
    mainAccountId: 0,
    startDate: null as Date | null,
    endDate: null as Date | null,
    accountNumber: '',
    accountName: '',
    mainAccount: '',
    financialYear: null as number | null,
    transactionType: null as 'مدين' | 'دائن' | null,
    costCenterFrom: null as string | null,
    costCenterTo: null as string | null,
    project: null as string | null,
    currency: null as string | null
  };

  clearFilters() {
    this.filterData = {
      mainAccountId: 0,
      startDate: null,
      endDate: null,
      accountNumber: '',
      accountName: '',
      mainAccount: '',
      financialYear: null,
      transactionType: null,
      costCenterFrom: null,
      costCenterTo: null,
      project: null,
      currency: null
    };
    this.costCenters.forEach(c => c.selected = false);
    this.filteredTransactions = [...this.transactions];
    this.calculateTotals();
  }

  totalDebit = 0;
  totalCredit = 0;
  finalBalance = 0;
  avgTransaction = 0;

  constructor(
    private messageService: MessageService,
    private accountsService: AccountsService,
    private entitiesService: EntitiesService
  ) { }

  ngOnInit() {
    this.loadCostCenters();
    this.loadParentAccounts();
    this.loadFinancialReportByEntity();
    this.loadAccounts();



  }






  loadAccounts() {
    this.accountsService.getAccounts().subscribe({
      next: (res: Account[]) => {
        this.accounts = res;               // بيانات الشجرة
        this.filteredAccountsList = this.getAllChildAccounts(res); // استخراج كل الحسابات الفرعية
      },
      error: (err) => console.error('Error loading accounts', err)
    });
  }


  // استخراج كل الحسابات الفرعية مع تجاهل مراكز التكلفة
  getAllChildAccounts(accounts: Account[]): Account[] {
    let children: Account[] = [];

    accounts.forEach(acc => {
      if (acc.type === 'Cost_Centers') return; // تجاهل مراكز التكلفة

      if (acc.children && acc.children.length > 0) {
        // إضافة الأبناء مباشرة إذا ليس مركز تكلفة
        children.push(...acc.children.filter(c => c.type !== 'Cost_Centers'));
        // استدعاء إعادة للطريقة للأبناء
        children.push(...this.getAllChildAccounts(acc.children));
      }
    });

    return children;
  }

loadParentAccounts(openDialog: boolean = false) {
  this.entitiesService.getAllEntities().subscribe({
    next: (res) => {
      this.parentAccounts = res;
      this.allParentAccounts = [...res];
      this.filteredParentAccounts = [...this.parentAccounts];

      if (openDialog) {
        this.parentAccounts.forEach(parent => {
          parent.children = this.getLeafAccounts(parent.children || []);
        });
        this.displayAccountDialog = true;
      }
    },
    error: (err) => {
      console.error('Failed to load parent accounts', err);
    }
  });
}


// دالة مساعدة للحصول على الحسابات الأبناء النهائيين
getLeafAccounts(accounts: Account[]): Account[] {
  return accounts.reduce((leaves: Account[], acc) => {
    if (!acc.children || acc.children.length === 0) {
      leaves.push(acc);
    } else {
      leaves.push(...this.getLeafAccounts(acc.children));
    }
    return leaves;
  }, []);
}


  flattenChildAccounts(accounts: Account[]): Account[] {
    let result: Account[] = [];

    accounts.forEach(acc => {
      if (acc.type === 'Cost_Centers') return; // تجاهل مراكز التكلفة

      if (acc.children && acc.children.length > 0) {
        result = result.concat(this.flattenChildAccounts(acc.children));
      }

      if (acc.parentId != null) { // الحسابات الأبناء فقط
        result.push(acc);
      }
    });

    return result;
  }
filterAccountsRecursive(accounts: Account[], term: string): Account[] {
  const lowerTerm = term.toLowerCase();
  return accounts
    .map(acc => {
      let matchChildren: Account[] = [];
      if (acc.children && acc.children.length) {
        matchChildren = this.filterAccountsRecursive(acc.children, term);
      }
      const matchesSelf = acc.name.toLowerCase().includes(lowerTerm) || acc.id.toString().includes(lowerTerm);
      if (matchesSelf || matchChildren.length) {
        return { ...acc, children: matchChildren };
      }
      return null;
    })
    .filter(acc => acc !== null) as Account[];
}

updateFilteredAccounts() {
  const filter = this.accountFilter.trim().toLowerCase();

  let accountsToFilter: Account[] = [];

  if (this.currentFocus === 'subAccount') {
    // الحسابات الرئيسية فقط
    accountsToFilter = this.allParentAccounts.filter(acc => !acc.parentId);
  } else if (this.currentFocus === 'mainAccount') {
    // الحسابات الفرعية فقط
    accountsToFilter = this.flattenChildAccounts(this.accounts);
  }

  if (!filter) {
    this.filteredParentAccounts = [...accountsToFilter];
  } else {
    const filtered = accountsToFilter.filter(acc =>
      acc.name.toLowerCase().includes(filter) || acc.id.toString().includes(filter)
    );

    this.filteredParentAccounts = filtered.length ? filtered : [...accountsToFilter];
  }
}



 loadCostCenters() {
  this.accountsService.getAllCostCenters().subscribe({
    next: (res: Account[]) => {

      // تحميل الأبناء فقط (الذين لديهم parentId)
      this.childCostCenters = res.filter(a => 
        a.type === 'Cost_Centers' && a.parentId
      );

      this.filteredCostCentersList = [...this.childCostCenters];
    },

    error: (err) => console.error('Failed to load cost centers', err)
  });
}

  filteredCostCenters() {
    const filter = this.costCenterFilter.trim().toLowerCase();
    if (!filter) {
      this.filteredCostCentersList = [...this.childCostCenters];
    } else {
      this.filteredCostCentersList = this.childCostCenters.filter(cc =>
        cc.name.toLowerCase().includes(filter) || (cc.code ?? '').toLowerCase().includes(filter)
      );
    }
  }

  // ===== دالة اختيار مركز التكلفة =====
  selectCostCenter(cc: Account) {
    if (this.currentFocus === 'costCenterFrom') {
      this.filterData.costCenterFrom = cc.id.toString();   // خزن الـ id للفلترة
      this.selectedCostCenterNameFrom = cc.name;          // عرض الاسم في الـ textbox
    } else if (this.currentFocus === 'costCenterTo') {
      this.filterData.costCenterTo = cc.id.toString();
      this.selectedCostCenterNameTo = cc.name;
    }

    this.costCenterDialog = false;
    this.filterReport(); // تطبيق الفلترة مباشرة
}





  // ===== تحميل التقرير للكيان المختار =====
  
loadFinancialReportByEntity() {
    if (!this.selectedEntity?.id) {
      this.messageService.add({ severity: 'warn', summary: 'تحذير', detail: 'اختر المقاول أولاً' });
      return;
    }

    this.loading = true;
    this.entitiesService.getLedgerByEntity(this.selectedEntity.id).subscribe({
      next: (res: JournalEntryDto[]) => {
        this.transactions = res.map(x => ({
          id: x.journalId,
          accountNumber: x.accountId?.toString() || '',
          accountName: x.entityName,
          date: new Date(x.date),
          type: x.debit > 0 ? 'مدين' : 'دائن',
          amount: x.debit > 0 ? x.debit : x.credit,
          balance: x.balanceAfter,
          costCenterId: x.costCenterId || x.accountId,  // use actual cost center id
          costCenter: this.childCostCenters.find(cc => cc.id === x.costCenterId)?.name || '',
          project: '',
          description: x.description,
          currency: ''
        }));

        this.filteredTransactions = [...this.transactions];
        this.calculateTotals();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تحميل البيانات' });
      }
    });
}

  // ===== تحميل التقرير مراكز التكلفه المختار =====





  // ===== فلترة التقرير =====
filterReport() {
    const fromId = this.filterData.costCenterFrom;
    const toId = this.filterData.costCenterTo;

    let selectedCostCenters: string[] = [];

    if (fromId && toId) {
      // تحديد كل المراكز بين from و to (باستخدام ترتيب موجود أو حسب Id)
      const fromIndex = this.childCostCenters.findIndex(cc => cc.id.toString() === fromId);
      const toIndex = this.childCostCenters.findIndex(cc => cc.id.toString() === toId);
      if (fromIndex > -1 && toIndex > -1) {
        const start = Math.min(fromIndex, toIndex);
        const end = Math.max(fromIndex, toIndex);
        selectedCostCenters = this.childCostCenters.slice(start, end + 1).map(cc => cc.id.toString());
      }
    } else if (fromId) {
      selectedCostCenters = [fromId];
    } else if (toId) {
      selectedCostCenters = [toId];
    }

    this.filteredTransactions = this.transactions.filter(t => {
      const matchAccount =
        (!this.filterData.accountNumber || t.accountNumber.includes(this.filterData.accountNumber)) &&
        (!this.filterData.accountName || t.accountName.includes(this.filterData.accountName)) &&
        (!this.filterData.mainAccount || t.accountNumber.startsWith(this.filterData.mainAccount));

      const matchCostCenter = selectedCostCenters.length === 0 || selectedCostCenters.includes(t.costCenterId?.toString() || '');

      const matchDate =
        (!this.filterData.startDate || t.date >= this.filterData.startDate) &&
        (!this.filterData.endDate || t.date <= this.filterData.endDate);

      const matchType = !this.filterData.transactionType || t.type === this.filterData.transactionType;
      const matchProject = !this.filterData.project || t.project?.includes(this.filterData.project);
      const matchCurrency = !this.filterData.currency || t.currency === this.filterData.currency;

      return matchAccount && matchCostCenter && matchDate && matchType && matchProject && matchCurrency;
    });

    this.calculateTotals();
  }




  // ===== حساب المجاميع =====
  calculateTotals() {
    this.totalDebit = this.filteredTransactions.filter(t => t.type === 'مدين').reduce((sum, t) => sum + t.amount, 0);
    this.totalCredit = this.filteredTransactions.filter(t => t.type === 'دائن').reduce((sum, t) => sum + t.amount, 0);
    this.finalBalance = this.totalDebit - this.totalCredit;
    this.avgTransaction = this.filteredTransactions.length
      ? this.filteredTransactions.reduce((sum, t) => sum + t.amount, 0) / this.filteredTransactions.length
      : 0;
  }


  // ===== فتح Dialog عند الضغط على F9 =====
  currentFocus: 'mainAccount' | 'subAccount' | 'costCenterFrom' | 'costCenterTo' | null = null;

@HostListener('window:keydown', ['$event'])
onF9Press(event: KeyboardEvent) {
  if (event.key === 'F9') {
    event.preventDefault();
    this.openLookup(); // هنا بدون type لأن F9 يعتمد على الحقل المحدد
  }
}

focusAndOpen(type: string) {
  // عمل فوكس حسب نوع الحقل
  setTimeout(() => {
    if (type === 'mainAccount') this.mainAccountInput.nativeElement.focus();
    if (type === 'subAccount') this.subAccountInput.nativeElement.focus();
    if (type === 'costCenterFrom') this.costFromInput.nativeElement.focus();
    if (type === 'costCenterTo') this.costToInput.nativeElement.focus();
  });

  // افتح شاشة الـ lookup
  this.openLookup(type);
}


openLookup(type?: string) {
  const lookupType = type || this.currentFocus;

  if (lookupType === 'subAccount') {
    // فقط الحسابات الرئيسية
    this.filteredParentAccounts = this.allParentAccounts.filter(acc => !acc.parentId);
    this.displayAccountDialog = true;
  }

  else if (lookupType === 'mainAccount') {
    // الحسابات الفرعية فقط
    this.filteredParentAccounts = this.flattenChildAccounts(this.accounts);
    this.displayAccountDialog = true;
  }

  else if (lookupType === 'costCenterFrom' || lookupType === 'costCenterTo') {
    this.loadCostCenters();
    this.costCenterDialog = true;
  }
}


  // ===== تطبيق الاختيار =====


applyAccountFilter() {
    if (this.selectedParentAccount) {
      this.selectedEntity = {
        id: this.selectedParentAccount.id,
        name: this.selectedParentAccount.name
      };
      this.displayAccountDialog = false;
      this.loadFinancialReportByEntity(); // تحميل البيانات الخاصة بالكيان بعد الاختيار
    }
}




onGlobalFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dt.filterGlobal(input.value, 'contains');
}



selectParentAccount(account: Account) {
    if (this.currentFocus === 'mainAccount') {
      this.filterData.mainAccount = account.name; // فقط للحساب الرئيسي
      this.filterData.mainAccountId = account.id; // اختياري لو تريد تخزين الرقم
    }
    else if (this.currentFocus === 'subAccount') {
      this.filterData.accountName = account.name; // فقط للحساب الفرعي
      this.filterData.accountNumber = account.id.toString();
    }

    this.selectedParentAccount = account;

    this.displayAccountDialog = false; // غلق الـ dialog بعد الاختيار
}



  onRowSelect(tx: Transaction | Transaction[] | null | undefined) {
    if (!tx) return;
    this.selectedTransaction = Array.isArray(tx) ? tx[0] : tx;
    this.displayDialog = true;
  }

  // ===== التصدير =====
  exportToPDF() {
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setFontSize(14);
    doc.text('تقرير الحركات المالية', 200 - 14, 10, { align: 'right' });

    const bodyData = this.filteredTransactions.map(x => [
      x.accountNumber, x.accountName, x.date.toLocaleDateString('ar-EG'),
      x.type, x.amount.toFixed(2), x.balance.toFixed(2),
      x.costCenter || '', x.project || '', x.description || '', x.currency || ''
    ]);

    autoTable(doc, {
      head: [['رقم الحساب', 'اسم الحساب', 'التاريخ', 'نوع الحركة', 'المبلغ', 'الرصيد', 'مركز التكلفة', 'المشروع', 'الوصف', 'العملة']],
      body: bodyData,
      startY: 20,
      styles: { halign: 'right', font: 'helvetica' },
      headStyles: { halign: 'center', fillColor: [41, 128, 185], textColor: 255 },
      theme: 'grid'
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 20;
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
