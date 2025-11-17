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
import { PaginatorModule } from 'primeng/paginator';
import { AccountsService, Account } from '../../apiservice/accounts.service';
import { JournalDto, JournalService } from '@/apiservice/journal.service';
import { EntitiesService, EntityRecord } from '@/apiservice/Entities.service';




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
    PaginatorModule,
    MultiSelectModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './journal-entries.html',
})
export class JournalEntriesComponent {

  // مصفوفة لتخزين كل الحسابات من API
  accounts: Account[] = [];

  // مصفوفة لتخزين نتائج الفلترة
  filteredAccountsList: Account[] = [];

  // نص الفلترة
  accountFilter: string = '';
  childAccounts: EntityRecord[] = []; // بدلاً من Account[]
filteredVendorList: EntityRecord[] = [];



  filteredChildAccounts: Account[] = [];
  selectedParentCode: string = '';

  childCostCenters: Account[] = [];
  filteredCostCentersList: Account[] = [];
  costCenterFilter: string = '';

  vendorFilter: string = '';
 

  journalEntries: any[] = [];
  displayDialog = false;
  isEdit = false;


  currentJournal: any = {
    entries: [
      {
        account: '',
        accountCode: '',
        accountName: '', // أضف هذا
         entityId: 0,
         entityType: '',
        vendor: '',
        vendorAccount: '',
        description: '',
        debit: 0,
        credit: 0,
        costCenter: '',
        costCenterCode: '',
        tags: [],
        isVendorEnabled: false
      }
    ]
    ,
    totalDebit: 0,
    totalCredit: 0
  };


  costCenters = [
    { id: 1, name: 'Main', code: '1001' },
  ];


  tags = [{ name: 'Urgent' }, { name: 'Internal' }, { name: 'External' }, { name: 'Follow-up' }];


  accountDialog = false;
  costCenterDialog = false;
  vendorDialog = false;

  editingRowIndex = 0;
  editingField: 'account' | 'costCenter' | 'vendor' = 'account';

  selectedRowIndex = -1;
  selectedLine: any = null;
  copiedLine: any = null;

  undoStack: any[] = [];
  redoStack: any[] = [];

  vendorFormDialog = false;
  isEditVendor = false;
  currentVendor: any = { id: 0, name: '', account: '' };

  journalIdFilter: string = '';

  contextMenuItems = [
    { label: 'Copy Line', icon: 'pi pi-copy', command: () => this.copyLine() },
    { label: 'Paste Line', icon: 'pi pi-clone', command: () => this.pasteLine() },
    { label: 'Delete Line', icon: 'pi pi-trash', command: () => this.removeJournalLine(this.selectedRowIndex) }
  ];
  constructor(

    private messageService: MessageService,
    private entitiesService: EntitiesService,
    private confirmationService: ConfirmationService,
    private accountsService: AccountsService,
    private journalService: JournalService,

  ) {
  }


  ngOnInit(): void {
    this.loadAccounts();
    this.loadCostCenters();
    this.loadJournals();



  }


  loadCostCenters() {
    this.accountsService.getAllCostCenters().subscribe({
      next: (res: Account[]) => {
        // تصفية فقط الحسابات من نوع Cost Centers
        this.childCostCenters = res.filter(a => a.type === 'Cost_Centers');
        this.filteredCostCentersList = [...this.childCostCenters]; // للفلترة السريعة
      },
      error: (err) => console.error('Failed to load cost centers', err)
    });
  }

  loadJournals() {
    this.journalService.getJournals().subscribe({
      next: (data) => {
        this.journalEntries = data;

        // لكل قيد، اربط costCenterId بالاسم من القائمة
        this.journalEntries.forEach(journal => {
          if (journal.entries) {
            journal.entries.forEach((line: any) => {
              if (line.costCenterId != null && this.childCostCenters.length > 0) {
                const cc = this.childCostCenters.find(c => c.id === line.costCenterId);
                if (cc) {
                  line.costCenterName = cc.name; // الاسم للعرض
                  line.costCenterCode = cc.code; // الكود للعرض/تحديث
                }
              }
            });
          }
        });

        console.log('Loaded journals:', this.journalEntries);
      },
      error: (err) => {
        console.error('Failed to load journals', err);
      }
    });
  }

  updateFilteredAccounts() {
    const filter = this.accountFilter?.trim().toLowerCase() || '';

    // تحويل الشجرة إلى قائمة مسطحة
    let allChildren = this.flattenAccounts(this.accounts);

    // فلترة بالبحث
    if (filter) {
      allChildren = allChildren.filter(a =>
        a.name?.toLowerCase().includes(filter) || a.code.includes(filter)
      );
    }

    this.filteredAccountsList = allChildren;
  }




  flattenAccounts(accounts: any[]): any[] {
    let result: any[] = [];
    accounts.forEach(acc => {
      if (acc.children && acc.children.length > 0) {
        result = result.concat(this.flattenAccounts(acc.children));
      }
      if (acc.parentId != null) { // فقط الحسابات الفرعية
        result.push(acc);
      }
    });
    return result;
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

  // فلترة أثناء البحث في الـ Dialog
  filterChildAccounts() {
    const filter = this.accountFilter?.trim().toLowerCase() || '';
    let childAccounts = this.getAllChildAccounts(this.accounts); // جميع الأبناء

    if (filter) {
      childAccounts = childAccounts.filter(a =>
        a.name.toLowerCase().includes(filter) ||
        a.code.includes(filter)
      );
    }

    this.filteredAccountsList = childAccounts;
  }







  // تحويل الشجرة إلى قائمة مسطحة بالحسابات الفرعية فقط (تجاهل الحسابات الأب والمراكز)
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

  // تحديث filteredAccountsList عند الضغط على F9
  openAccountSearch(event: KeyboardEvent, rowIndex: number) {
    if (event.key === 'F9') {
      event.preventDefault();
      this.editingRowIndex = rowIndex;

      // تحديث القائمة لتظهر الحسابات الفرعية فقط
      this.filteredAccountsList = this.flattenChildAccounts(this.accounts);

      // فتح الـ Dialog
      this.accountDialog = true;
    }
  }

  addNewLine(index: number) {
    if (!this.currentJournal.entries) {
      this.currentJournal.entries = [];
    }

    const newLine = {
      account: '',
      accountCode: '',
      vendor: '',
      vendorAccount: '',
      description: '',
      debit: 0,
      credit: 0,
      costCenter: '',
      costCenterCode: '',
      tags: [],
      isVendorEnabled: false
    };

    if (index === -1) {
      this.currentJournal.entries.push(newLine);
    } else {
      this.currentJournal.entries.splice(index + 1, 0, newLine);
    }
  }


  isBalanced(): boolean {
    return this.currentJournal.totalDebit === this.currentJournal.totalCredit;
  }



  // عند أي تغيير في مدين أو دائن، يحدث حساب الإجماليات
  updateTotals() {
    if (!this.currentJournal || !this.currentJournal.entries) return;

    let totalDebit = 0;
    let totalCredit = 0;

    for (let line of this.currentJournal.entries) {
      totalDebit += parseFloat(line.debit) || 0;
      totalCredit += parseFloat(line.credit) || 0;
    }

    this.currentJournal.totalDebit = totalDebit;
    this.currentJournal.totalCredit = totalCredit;
  }

  generateRandomEntryNumber(): string {
    const randomPart = Math.floor(100000 + Math.random() * 900000); // رقم عشوائي من 6 خانات
    return `JE-${randomPart}`;
  }


  // 🟢 إضافة / تعديل / حذف
  openNewJournal() {
    this.isEdit = false;
    this.currentJournal = {
      entryNumber: this.generateRandomEntryNumber(), // 
      date: new Date(), // ✅ هذا هو التعديل المهم
      status: 'Pending',
      type: 'Daily',
      entries: [
        { account: '', accountCode: '', vendor: '', vendorAccount: '', description: '', debit: 0, credit: 0, costCenter: '', costCenterCode: '', tags: [] }
      ],
      totalDebit: 0,
      totalCredit: 0,
      description: ''
    };


    this.displayDialog = true;
  }


  editJournal(journal: any) {
    this.isEdit = true;

    // نسخ عميق للقيد
    this.currentJournal = JSON.parse(JSON.stringify(journal));

    // التأكد من تحويل الحقول القديمة إلى entries
    if (this.currentJournal.lines) {
     this.currentJournal.entries = this.currentJournal.lines.map((line: any) => {
  let ccName = '';
  let ccCode = '';
  if (line.costCenterId != null && this.childCostCenters?.length) {
    const cc = this.childCostCenters.find(c => c.id === line.costCenterId);
    if (cc) {
      ccName = cc.name;
      ccCode = cc.code;
    }
  }

  const entry = {
    id: line.id ?? 0,
    accountId: line.accountId ?? null,
    accountCode: line.account?.code ?? line.accountCode ?? '',
    accountName: line.account?.name ?? line.accountName ?? '',
    description: line.description ?? '',
    debit: line.debit ?? 0,
    credit: line.credit ?? 0,
    costCenterId: line.costCenterId ?? null,
    costCenter: ccName,
    costCenterCode: ccCode,
    costCenterName: ccName,
    tags: line.tags ?? [],
    isVendorEnabled: line.isVendorEnabled ?? false,
    entityId: line.entityId ?? null,
    entityType: line.entityType ?? null,
    vendor: '',        // سيتم تعبئتها بعد التحميل
    vendorAccount: ''  // سيتم تعبئتها بعد التحميل
  };

  // إذا كان هناك entityId و entityType، قم بتحميل بيانات الانتتى
  if (entry.entityId && entry.entityType) {
   this.entitiesService.getById(entry.entityId).subscribe({
  next: (entity) => {
    entry.vendor = entity.name ?? '';
    entry.vendorAccount = entity.code ?? '';
  }
});

  }

  return entry;
});


    } else if (!this.currentJournal.entries) {
      
      this.currentJournal.entries = [];
    }

    // تأكد من وجود التاريخ
    if (!this.currentJournal.date) {
      this.currentJournal.date = new Date();
    } else {
      this.currentJournal.date = new Date(this.currentJournal.date);
    }

    // حساب الإجماليات بعد التحويل
    this.calculateCurrentTotals();

    // عرض نافذة التعديل
    this.displayDialog = true;
  }



  addJournalLine() {
    this.currentJournal.entries.push({
      id: 0,
      account: null,           // كائن الحساب كامل (للعرض)
      accountId: null,         // معرف الحساب
      accountCode: '',         // كود الحساب
      accountName: '',         // اسم الحساب للعرض
      vendor: '',              // اسم المورد
      vendorAccount: '',       // كود المورد
      description: '',         // الوصف
      debit: 0,                // المدين
      credit: 0,               // الدائن
      costCenter: '',          // اسم مركز التكلفة للعرض
      costCenterCode: '',      // كود مركز التكلفة
      costCenterId: null,      // معرف مركز التكلفة
      costCenterName: '',      // اسم مركز التكلفة للإرسال للـ backend
      tags: [],                // العلامات
      entityId: null,          // معرف الفاندور أو مركز التكلفة
      entityType: null,        // 'Vendor' أو 'CostCenter'
      invalidAccount: false,   // للتحقق من صحة الحساب
      invalidVendor: false,    // للتحقق من المورد
      invalidCostCenter: false // للتحقق من مركز التكلفة
    });

    this.pushUndo(); // لتسجيل الخطوة في undo إذا كانت موجودة
  }



  removeJournalLine(index: number) {
    if (index >= 0) {
      this.currentJournal.entries.splice(index, 1);
      this.calculateCurrentTotals();
      this.pushUndo();
    }
  }

  calculateTagTotal(tagName: string) {
    return this.currentJournal.entries.filter((l: any) => l.tags?.includes(tagName))
      .reduce((sum: any, l: any) => sum + (Number(l.debit || 0) + Number(l.credit || 0)), 0);
  }

  saveJournal() {
    let valid = true;

    // تحقق من كل سطر
    this.currentJournal.entries.forEach((line: any) => {
      line.invalidAccount = !line.accountCode && !line.accountId;
      if (line.invalidAccount) valid = false;

      line.invalidCostCenter = line.costCenterId === undefined || line.costCenterId === null;

      line.debit = line.debit ?? 0;
      line.credit = line.credit ?? 0;
    });

    // تحقق من تساوي المدين والدائن
    this.calculateCurrentTotals();
    if (this.currentJournal.totalDebit !== this.currentJournal.totalCredit) {
      this.messageService.clear();
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Total debit does not equal total credit'
      });
      valid = false;
    }

    if (!valid) {
      this.messageService.clear();
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Please correct highlighted fields before saving'
      });
      return;
    }

    if (!this.currentJournal.entries || this.currentJournal.entries.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Journal must have at least one line'
      });
      return;
    }

    // تجهيز payload مطابق للـ JournalDto
    const journalPayload: JournalDto = {
      id: this.currentJournal.id ?? 0, // ← Id القيد وليس AccountId
      journalNumber: this.currentJournal.entryNumber?.trim() || `JE-${Date.now()}`,
      date: this.currentJournal.date ?? new Date(),
      description: this.currentJournal.notes ?? '',
      totalDebit: this.currentJournal.totalDebit ?? 0,
      totalCredit: this.currentJournal.totalCredit ?? 0,
      status: 'Draft',
      createdBy: this.currentJournal.createdBy ?? '',
      entries: this.currentJournal.entries.map((line: any) => ({
        id: line.id ?? 0,
        accountId: line.accountId ?? 0,          // رقم الحساب إن وجد
        accountCode: line.accountCode ?? null,   // كود الحساب إن وجد
        accountName: line.accountName ?? '',
        debit: line.debit ?? 0,
        credit: line.credit ?? 0,
        entityId: line.entityId ?? null,
        entityType: line.entityType?.trim() || '',
        description: line.description?.trim() || '',
        costCenterId: line.costCenterId ?? null,
        costCenterName: line.costCenterName ?? null,
        journalId: this.currentJournal.id ?? 0
      }))
    };

    // تحديد إذا القيد جديد أو موجود
    const isNew = !this.currentJournal.id || this.currentJournal.id === 0;

    const saveObservable = isNew
      ? this.journalService.createJournal(journalPayload)
      : this.journalService.updateJournal(this.currentJournal.id, journalPayload);

    saveObservable.subscribe({
      next: (savedJournal: JournalDto) => {
        this.displayDialog = false;
        this.messageService.clear();
        this.loadJournals();
        this.messageService.add({
          severity: 'success',
          summary: isNew ? 'Saved' : 'Updated',
          detail: isNew ? 'Entry created successfully' : 'Entry updated successfully'
        });

        // استخدام Id القيد وليس AccountId
        this.currentJournal.id = savedJournal.id;

        if (isNew) {
          this.journalEntries.push({ ...this.currentJournal });
        } else {
          const index = this.journalEntries.findIndex(j => j.id === savedJournal.id);
          if (index !== -1) {
            this.journalEntries[index] = { ...this.currentJournal };
          }
        }
      },
      error: (err) => {
        console.error('Failed to save journal', err);

        let detailMsg = 'Failed to save entry';

        if (err?.error?.message) {
          detailMsg = err.error.message;
          if (err.error.missingAccounts && err.error.missingAccounts.length > 0) {
            const missing = err.error.missingAccounts
              .filter((x: string) => x && x.trim() !== '')
              .join(', ');
            if (missing) detailMsg += `: ${missing}`;
          }
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: detailMsg
        });
      }
    });
  }


  deleteJournal(index: number, journalId: number) {
    this.confirmationService.confirm({
      message: 'Do you want to delete this entry?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.journalService.deleteJournal(journalId).subscribe({
          next: () => {
            this.journalEntries.splice(index, 1);
            this.messageService.clear();
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: 'Entry deleted successfully'
            });
          },
          error: (err) => {
            console.error('Failed to delete journal', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete entry'
            });
          }
        });
      }
    });
  }



  formatWithCommas(line: any, field: 'debit' | 'credit') {
    let val = line[field]?.toString().replace(/,/g, '');
    if (!val) return;

    const numericVal = Number(val);
    if (!isNaN(numericVal)) {
      line[field] = numericVal;
    }

    if (field === 'debit' && line.debit) line.credit = null;
    if (field === 'credit' && line.credit) line.debit = null;

    // حساب الإجماليات
    this.currentJournal.totalDebit = this.currentJournal.entries.reduce(
      (sum: number, entry: any) => sum + (entry.debit || 0), 0
    );
    this.currentJournal.totalCredit = this.currentJournal.entries.reduce(
      (sum: number, entry: any) => sum + (entry.credit || 0), 0
    );

    // إعادة تعيين المصفوفة لإخبار Angular بالتغيير
    this.currentJournal.entries = this.currentJournal.entries.slice();
  }


  calculateCurrentTotals() {
    this.currentJournal.totalDebit = this.currentJournal.entries.reduce((sum: any, line: any) => {
      const val = parseFloat((line.debit || '0').toString().replace(/,/g, ''));
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    this.currentJournal.totalCredit = this.currentJournal.entries.reduce((sum: any, line: any) => {
      const val = parseFloat((line.credit || '0').toString().replace(/,/g, ''));
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  }





  handleAccountInput(event: any, rowIndex: number) {
    const inputValue = event.target.value.trim();
    const line = this.currentJournal.entries[rowIndex];

    const found = this.filteredAccountsList.find(
      a => a.code === inputValue || a.name === inputValue
    );

    if (found) {
      line.accountCode = found.code;
      line.accountName = found.name;
      line.accountId = found.id;      // 🔹 إضافة الـ ID الرقمي هنا
      line.invalidAccount = false;

      if (
        found.name.toLowerCase().includes('vendor') ||
        found.code.startsWith('201')
      ) {
        line.isVendorEnabled = true;
      } else {
        line.isVendorEnabled = false;
        line.vendor = '';
        line.vendorAccount = '';
      }

    } else {
      line.accountId = 0;              // 🔹 لم يتم العثور على الحساب
      line.invalidAccount = inputValue !== '';
      line.accountName = '';
      line.accountCode = inputValue;
      line.isVendorEnabled = false;
      line.vendor = '';
      line.vendorAccount = '';
    }
  }





























  // -------------------- Vendor Dialog / CRUD --------------------

  



  loadChildAccounts(parentCode: string) {
    this.selectedParentCode = parentCode;

    this.entitiesService.getEntityTypeAccounts().subscribe({
      next: (res: Account[]) => {
        this.childAccounts = res;
        this.filteredVendorList = [...res]; // عرض جميع الحسابات الابنة
      },
      error: (err) => console.error('Failed to load child accounts', err)
    });
  }

// -------------------- Load Entities by Account --------------------
loadEntitiesByAccount(accountId: number, type?: string) {
  if (!accountId) return;

  this.entitiesService.getByAccount(accountId, type).subscribe({
    next: (res: EntityRecord[]) => {
      this.childAccounts = res;           // تحديث قائمة الحسابات
      this.filteredVendorList = [...res]; // تحديث القائمة المعروضة في الفلتر
    },
    error: (err) => {
      console.error('Failed to load entities', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load entities for the selected account'
      });
    }
  });
}

openVendorDialog(event: any, rowIndex: number) {
  this.editingRowIndex = rowIndex;

  if (event.key === 'F9') {
    const line = this.currentJournal.entries[rowIndex];

    if (!line.accountId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'تحذير',
        detail: 'الرجاء إدخال الحساب أولاً'
      });
      return;
    }

    // فتح نافذة الاختيار
    this.vendorDialog = true;

    // تحميل الـ Entities المرتبطة بالحساب
    // النوع هنا لا يمرّر ثابتاً، بل يتم جلبه من الحساب نفسه عبر API
    this.loadEntitiesByAccount(line.accountId);
  }
}


  openAddVendor() {
    this.isEditVendor = false;
    // نستخدم الحساب الأب الحالي لإنشاء مورد جديد
    const line = this.currentJournal.entries[this.editingRowIndex];
    this.currentVendor = {
      id: this.childAccounts.length + 1, // رقم جديد بناءً على الحسابات الابنة
      name: '',
      account: line.accountCode || ''    // ربطه بالحساب الأب
    };
    this.vendorFormDialog = true;
  }

  openEditVendor(vendor: Account) {
    this.isEditVendor = true;
    this.currentVendor = JSON.parse(JSON.stringify(vendor));
    this.vendorFormDialog = true;
  }

  saveVendor() {
    if (this.isEditVendor) {
      const index = this.childAccounts.findIndex(v => v.id === this.currentVendor.id);
      if (index > -1) this.childAccounts[index] = JSON.parse(JSON.stringify(this.currentVendor));
    } else {
      this.childAccounts.push(JSON.parse(JSON.stringify(this.currentVendor)));
    }
    this.vendorFormDialog = false;
    this.updateFilteredVendors();
  }

  cancelVendor() {
    this.vendorFormDialog = false;
  }


  // --------------------  Vendors --------------------

updateFilteredVendors() {
  const filter = this.vendorFilter.trim().toLowerCase();

  if (!filter) {
    this.filteredVendorList = [...this.childAccounts]; // استخدام الحسابات الابنة كما هي
  } else {
    this.filteredVendorList = this.childAccounts.filter(v =>
  v.name?.toLowerCase().includes(filter) || (v.code ?? '').includes(filter)
);
  }
}


  handleVendorFilterInput(event: any) {
    this.vendorFilter = event.target.value;
    this.updateFilteredVendors();
  }

  // -------------------- Handle Vendor Input in Journal Line --------------------
handleVendorInput(event: any, rowIndex: number) {
  const inputValue = event.target.value.trim().toLowerCase();
  const line = this.currentJournal.entries[rowIndex];

  // فلترة قائمة الـ Entities حسب الاسم أو الكود
  this.filteredVendorList = this.childAccounts.filter(v =>
    v.name?.toLowerCase().includes(inputValue) ||
    (v.code ?? '').toLowerCase().includes(inputValue)
  );

  // محاولة إيجاد مطابق كامل (اسم أو كود)
  const found = this.childAccounts.find(v =>
    v.name?.toLowerCase() === inputValue ||
    (v.code ?? '').toLowerCase() === inputValue
  );

  if (found) {
    // عند إيجاد الكيان
    line.vendor = found.name ?? '';
    line.vendorAccount = found.code ?? '';
    line.entityId = found.id ?? null;
    line.entityType = found.entityType ?? null;
    line.invalidVendor = false;
  } else {
    // في حالة عدم إيجاد كيان مطابق
    line.vendor = '';
    line.vendorAccount = '';
    line.entityId = null;
    line.entityType = null;
    line.invalidVendor = inputValue !== '';
  }
}

  // -------------------- Select Vendor from Dialog --------------------
selectVendor(vn: any) {
  if (this.editingRowIndex !== null && this.editingRowIndex >= 0) {
    const line = this.currentJournal.entries[this.editingRowIndex];

    // تعبئة معلومات الكيان المختار (Supplier / Customer / Contractor / ... )
    line.vendor = vn.name;              // الاسم للعرض
    line.vendorAccount = vn.code;       // رقم الحساب
    line.entityId = vn.id ?? null;      // ID الخاص بالكيان
    line.entityType = vn.entityType;    // النوع الحقيقي من الداتا

    line.invalidVendor = false;

    // إغلاق نافذة الاختيار
    this.vendorDialog = false;
    this.vendorFilter = '';
  }
}





  // -------------------- Optional: Auto-update Filtered List --------------------
  onVendorFilterChange(value: string) {
    this.vendorFilter = value;
    this.updateFilteredVendors();
  }





























  




  // 🟢 الفلاتر

  filteredJournals(filterText: string) {
    if (!this.journalEntries) return [];

    // تحويل الفلتر لأي نوع إلى نص وتجاهل المسافات
    const filter = filterText != null ? filterText.toString().trim().toLowerCase() : '';

    if (!filter) return this.journalEntries;

    return this.journalEntries.filter(j => {
      // نحول كل قيمة من السجلات إلى نص لمطابقتها مع الفلتر
      const id = j.entryNumber?.toString().toLowerCase() || '';
      const date = j.date?.toString().toLowerCase() || '';
      const totalDebit = j.totalDebit?.toString().toLowerCase() || '';
      const totalCredit = j.totalCredit?.toString().toLowerCase() || '';

      // تحقق إذا أي عمود يحتوي على النص المطلوب
      return id.includes(filter) || date.includes(filter) || totalDebit.includes(filter) || totalCredit.includes(filter);
    });
  }


  filteredAccounts() {
    const filter = this.accountFilter.trim();
    if (!filter) return this.accounts;
    return this.accounts.filter(a =>
      a.name.toLowerCase().includes(filter.toLowerCase()) ||
      a.code.includes(filter)
    );
  }


  selectAccount(acc: any) {
    if (this.editingRowIndex >= 0) {
      const line = this.currentJournal.entries[this.editingRowIndex];

      line.account = acc.code;       // عرض رقم الحساب في الحقل
      line.accountCode = acc.code;   // إذا كنت تستخدم هذا الحقل أيضاً في الـ payload
      line.accountName = acc.name;   // عرض اسم الحساب
      line.accountId = acc.id;       // حفظ الـ ID
      line.invalidAccount = false;

      // تحقق إذا الحساب مرتبط بمورد
      line.isVendorEnabled = acc.name.toLowerCase().includes('vendor') || acc.code.startsWith('201');
      if (!line.isVendorEnabled) {
        line.vendor = '';
        line.vendorAccount = '';
      }

      this.accountDialog = false;    // اغلاق الديالوج
    }
  }




  filteredCostCenters() {
    const filter = this.costCenterFilter.trim().toLowerCase();
    if (!filter) {
      this.filteredCostCentersList = [...this.childCostCenters];
    } else {
      this.filteredCostCentersList = this.childCostCenters.filter(cc =>
        cc.name.toLowerCase().includes(filter) || cc.code.toLowerCase().includes(filter)
      );
    }
  }
  // فتح نافذة البحث عند الضغط F9
  openCostCenterSearch(event: KeyboardEvent, rowIndex: number) {
    this.editingRowIndex = rowIndex;

    if (event.key === 'F9') {
      this.accountsService.getAllCostCenters().subscribe({
        next: (res: Account[]) => {
          this.childCostCenters = res;
          this.filteredCostCenters(); // فلترة أولية
          this.costCenterDialog = true;
        },
        error: (err) => console.error('Failed to load cost centers', err)
      });
    }
  }

  loadChildCostCenters(parentCode: string) {
    this.accountsService.getAllCostCenters().subscribe({
      next: (res: Account[]) => {
        this.childCostCenters = res; // جميع مراكز التكلفة الفرعية
        this.filteredCostCenters(); // فلترة أولية لعرضها في الجدول
      },
      error: (err) => console.error('Failed to load child cost centers', err)
    });
  }


  // اختيار مركز تكلفة
  selectCostCenter(cc: any) {
    if (this.editingRowIndex !== null && this.editingRowIndex >= 0) {
      const line = this.currentJournal.entries[this.editingRowIndex];

      // تعبئة معلومات مركز التكلفة
      line.costCenter = cc.name;           // الاسم للعرض
      line.costCenterCode = cc.code;       // الكود
      line.costCenterId = cc.id ?? null;   // معرف مركز التكلفة
      line.costCenterName = cc.name;       // الاسم لإرساله للـ backend
      line.entityId = cc.id ?? null;       // يمكن استخدامه إذا كان مرتبطًا بنفس الحقل العام
      line.entityType = 'CostCenter';      // النوع
      line.invalidCostCenter = false;

      // إغلاق نافذة اختيار مركز التكلفة
      this.costCenterDialog = false;
      this.costCenterFilter = '';
    }
  }


  handleCostCenterInput(event: any, rowIndex: number) {
    const inputValue = event.target.value.trim();
    const line = this.currentJournal.entries[rowIndex];

    const found = this.filteredCostCentersList.find(
      a => a.code === inputValue || a.name === inputValue
    );

    if (found) {
      line.costCenterCode = found.code;
      line.costCenterName = found.name;
      line.costCenterId = found.id;      // 🔹 إضافة الـ ID الرقمي هنا
      line.invalidAccount = false;

      if (
        found.name.toLowerCase().includes('vendor') ||
        found.code.startsWith('201')
      ) {
        line.isVendorEnabled = true;
      } else {
        line.isVendorEnabled = false;
        line.vendor = '';
        line.vendorAccount = '';
      }

    } else {
      line.costCenterId = 0;              // 🔹 لم يتم العثور على الحساب
      line.invalidAccount = inputValue !== '';
      line.costCenterName = '';
      line.costCenterCode = inputValue;
      line.isVendorEnabled = false;

    }
  }



  // 🟢 نسخ / لصق
  copyLine() {
    if (this.selectedRowIndex >= 0) {
      this.copiedLine = { ...this.currentJournal.entries[this.selectedRowIndex] };
      this.messageService.clear(); this.messageService.add({ severity: 'info', summary: 'Copied', detail: 'Line copied' });
    }
  }
  pasteLine() {
    if (this.copiedLine) {
      this.currentJournal.entries.splice(this.selectedRowIndex + 1, 0, { ...this.copiedLine });
      this.messageService.clear(); this.messageService.add({ severity: 'success', summary: 'Pasted', detail: 'Line pasted' });
      this.calculateCurrentTotals(); this.pushUndo();
    }
  }

  // 🟢 Undo / Redo
  pushUndo() { this.undoStack.push(JSON.stringify(this.currentJournal.entries)); if (this.undoStack.length > 50) this.undoStack.shift(); }
  undo() { if (this.undoStack.length > 0) { this.redoStack.push(JSON.stringify(this.currentJournal.entries)); this.currentJournal.entries = JSON.parse(this.undoStack.pop()!); this.calculateCurrentTotals(); } }
  redo() { if (this.redoStack.length > 0) { this.undoStack.push(JSON.stringify(this.currentJournal.entries)); this.currentJournal.entries = JSON.parse(this.redoStack.pop()!); this.calculateCurrentTotals(); } }


  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent) {
    const key = event.key ? event.key.toLowerCase() : '';

    if (event.ctrlKey) {
      switch (key) {
        case 'c': case 'ؤ': this.copyLine(); event.preventDefault(); break;
        case 'v': case 'ر': this.pasteLine(); event.preventDefault(); break;
        case 'x': case 'ء': this.copyLine(); this.removeJournalLine(this.selectedRowIndex); event.preventDefault(); break;
        case 'z': case 'ئ': this.undo(); event.preventDefault(); break;
        case 'y': case 'غ': this.redo(); event.preventDefault(); break;
      }
    } else if (key === 'delete' && this.selectedRowIndex >= 0) { this.removeJournalLine(this.selectedRowIndex); event.preventDefault(); }
  }



  // 🟢 الطباعة
  printEntry(journal: any) {
    if (!journal || !journal.entries || !journal.entries.length) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'No entries to print'
      });
      return;
    }

    const lines = journal.entries.map((line: any) => `
    <tr>
      <td>${line.account ?? line.accountCode ?? ''}</td>
      <td>${line.description ?? ''}</td>
      <td>${line.debit ?? 0}</td>
      <td>${line.credit ?? 0}</td>
      <td>${line.costCenter ?? ''}</td>
      <td>${line.tags?.join(', ') ?? ''}</td>
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
    <body onload="window.print();window.close();">
      <h2>Company Name</h2>
      <h3>Journal Entry #${journal.id} - ${journal.date}</h3>
      <table>
        <tr>
          <th>Account</th><th>Description</th><th>Debit</th><th>Credit</th><th>Cost Center</th><th>Tags</th>
        </tr>
        ${lines}
        <tr>
          <td colspan="2" style="text-align:right"><strong>Total:</strong></td>
          <td>${journal.totalDebit ?? 0}</td>
          <td>${journal.totalCredit ?? 0}</td>
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

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.open();
      newWindow.document.write(html);
      newWindow.document.close();
    }
  }

}
