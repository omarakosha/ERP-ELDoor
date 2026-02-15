import { Component, OnInit } from '@angular/core';
import { MessageService, ConfirmationService, TreeNode } from 'primeng/api';
import { AccountsService, Account } from '../../apiservice/accounts.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TreeModule } from 'primeng/tree';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { HttpClientModule } from '@angular/common/http';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectButtonModule } from 'primeng/selectbutton';
import { Select } from "primeng/select";
import { LoaderService } from '@/apiservice/loading.service';
import { TranslateService } from '@ngx-translate/core';

export interface MyTreeNode extends TreeNode {
  key: string;
  label: string;
  data: Account;
  children?: MyTreeNode[];
  level?: number;
}

@Component({
  standalone: true,
  selector: 'app-accounts-manager',
  styleUrls: ['./accounts-manager.scss'],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    TreeModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
    CheckboxModule,
    SelectButtonModule,
    Select
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './accounts-manager.html',
})
export class AccountsManager implements OnInit {
  accountsTree: MyTreeNode[] = [];
  filteredTree: MyTreeNode[] = [];
  selectedNode: MyTreeNode | null = null;
  isTypeDisabled: boolean = false;

  // accounts-manager.ts
  accountTypes = [
    { label: 'Revenue', value: 'Revenue' },
    { label: 'Expense', value: 'Expense' },
    { label: 'Asset', value: 'Asset' },
    { label: 'Liability', value: 'Liability' },
    { label: 'Equity', value: 'Equity' },
    { label: 'Cost Centers', value: 'Cost_Centers' }
  ];

  balanceTypes = [
    { label: 'Debit', value: 'Debit' },
    { label: 'Credit', value: 'Credit' },
    { label: 'Both', value: 'Both' }
  ];

entityTypes = [
  { label: 'اختر النوع', value: null }, // الخيار الافتراضي / فارغ
  { label: 'Suppliers', value: 'Suppliers' },
  { label: 'Customers', value: 'Customers' },
  { label: 'Contractors', value: 'Contractors' }
];



  displayDialog = false;
  isEdit = false;
  selectedAccount: Account | null = null;
  currentNode: MyTreeNode | null = null;
  parentNode: MyTreeNode | null = null;
  searchTerm: string = '';
   loading: boolean = false;

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private accountsService: AccountsService,
      private translate: TranslateService,
     public loaderService: LoaderService
  ) { }

  ngOnInit() {
    this.loadAccounts();

  }

loadAccounts() {
  this.loaderService.show(); // 🟢 تشغيل اللودنق قبل الطلب

  this.accountsService.getAccounts().subscribe({
    next: (accounts: Account[]) => {

      // ✅ إصلاح children = null → []
      const normalizeChildren = (accs: Account[]) => {
        accs.forEach(a => {
          if (!Array.isArray(a.children)) a.children = []; // تحويل null إلى []
          normalizeChildren(a.children);
        });
      };
      
      normalizeChildren(accounts);

      // ✅ تحويل البيانات إلى TreeNode
      this.accountsTree = this.mapAccountsToTreeNodes(accounts);

      // ✅ تحديث مستويات الشجرة
      this.updateLevels(this.accountsTree);

      // ✅ تحديث العرض
      this.filteredTree = [...this.accountsTree];

      this.loaderService.hide(); // 🟢 إخفاء اللودنق بعد التحميل
    },
           error: (err) => {
      console.error('Failed to load accounts', err);
      this.loaderService.hide(); // 🟢 إيقاف اللودنق عند الخطأ
    this.loaderService.hide(); // إيقاف اللودنق عند الخطأ

  this.translate.get(['TOAST.ERROR_SUMMARY','TOAST.ERROR_DETAIL_500']).subscribe(trans => {
    this.messageService.add({
      severity: 'error',
      summary: trans['TOAST.ERROR_SUMMARY'],
      detail: trans['TOAST.ERROR_DETAIL_500']
    });

      });
    }
    
  });
}




private mapAccountsToTreeNodes(accounts: Account[], level: number = 0): MyTreeNode[] {
    const mapNode = (acc: Account, lvl: number): MyTreeNode => ({
      key: acc.id.toString(),
      label: acc.name,
      data: { ...acc },
      level: lvl,
      expanded: false, // ✅ يضمن عدم الفتح تلقائياً
      children: (acc.children && acc.children.length > 0)
        ? acc.children.map(c => mapNode(c, lvl + 1))
        : []
    });

    return accounts.map(acc => mapNode(acc, level));
}



private updateLevels(nodes: MyTreeNode[], level: number = 0) {
    for (const node of nodes) {
      node.level = level;
      if (!node.children) node.children = [];
      this.updateLevels(node.children, level + 1);
    }
}

filterAccounts() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredTree = [...this.accountsTree];
      this.updateLevels(this.filteredTree);
      return;
    }
    const filterNodes = (nodes: MyTreeNode[], lvl: number = 0): MyTreeNode[] =>
      nodes
        .map(node => {
          const children = node.children ? filterNodes(node.children, lvl + 1) : [];
          const match = (node.label ?? '').toLowerCase().includes(term) || (node.data?.code ?? '').includes(term);
          if (match || children.length > 0) return { ...node, children, level: lvl };
          return null;
        })
        .filter(n => n !== null) as MyTreeNode[];
    this.filteredTree = filterNodes(this.accountsTree);
}

onNodeSelect(event: any): void {
    const node = event?.node as MyTreeNode;
    if (!node || !node.key) return;

    this.selectedNode = node;
    this.selectedAccount = node.data ?? null;

    if (node.children && node.children.length > 0) {
      node.expanded = !node.expanded;
    }

    console.log("✅ Selected Account:", this.selectedAccount);
}



onNodeExpand(event: any) {
    const expandedNode = event.node;
    // إذا العقدة من المستوى الأعلى → أغلق البقية
    if (this.filteredTree.includes(expandedNode)) {
      for (const node of this.filteredTree) {
        if (node !== expandedNode) {
          node.expanded = false;
        }
      }
    }
}


openNewAccount(parent: MyTreeNode | null) {
    this.isEdit = false;
    const code = this.generateAccountCode(parent);

    this.currentNode = {
      key: '',
      label: '',
      data: {
        id: 0,
        code,
        name: '',
        type: parent?.data.type ?? '', // الفرعي يأخذ نوع الرئيسي
        currency: '',
        description: '',
        active: true,
        autoRollover: false,
        allowTransactions: true,
        defaultTaxId: undefined,
        balanceType: '',
        entityType: ''
      } as Account,
      children: [],
      level: parent?.level ?? 0
    };
    this.parentNode = parent;

    // إذا هناك أب، قم بتعطيل اختيار النوع
    this.isTypeDisabled = !!parent;

    this.displayDialog = true;
}

openEditAccount(node: MyTreeNode | null) {
    if (!node) return;

    this.isEdit = true;

    this.currentNode = {
      key: node.key,
      label: node.label ?? '',
      data: { ...node.data },
      children: node.children ? [...node.children] : [],
      level: node.level
    };

    // إيجاد الأب
    this.parentNode = this.findParentNode(node.key, this.accountsTree);

    // تعطيل type إذا كان هناك أب (أي الحساب فرعي)
    this.isTypeDisabled = !!this.parentNode;

    this.displayDialog = true;
}

private findParentNode(key: string, nodes: MyTreeNode[], parent: MyTreeNode | null = null): MyTreeNode | null {
    for (const node of nodes) {
      if (node.key === key) return parent;
      if (node.children) {
        const found = this.findParentNode(key, node.children, node);
        if (found) return found;
      }
    }
    return null;
}

findNodeByKey(key: string, nodes: MyTreeNode[]): MyTreeNode | null {
    for (const node of nodes) {
      if (node.key === key) return node;
      if (node.children) {
        const found = this.findNodeByKey(key, node.children);
        if (found) return found;
      }
    }
    return null;
}


updateChildrenType(parentNode: MyTreeNode, newType: string) {
    if (!parentNode.children) return;

    for (const child of parentNode.children) {
      child.data.type = newType; // ✅ حرف صغير
      this.updateChildrenType(child, newType); // تحديث متداخل للأحفاد
    }
}



saveAccount() {
    if (!this.currentNode || !this.currentNode.label || !this.currentNode.data?.code) {
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Please enter name and code' });
      return;
    }

    const accountToSave: Account = {
      id: this.isEdit && this.currentNode?.key ? +this.currentNode.key : 0,
      name: this.currentNode?.label ?? '',
      code: this.currentNode?.data?.code ?? '',
      parentId: this.parentNode?.key ? +this.parentNode.key : undefined,
      active: this.currentNode?.data?.active ?? true,
      allowTransactions: this.currentNode?.data?.allowTransactions ?? true,
      autoRollover: this.currentNode?.data?.autoRollover ?? false,
      balanceType: this.currentNode?.data?.balanceType,
      currency: this.currentNode?.data?.currency ?? 'SAR',
      defaultTaxId: this.currentNode?.data?.defaultTaxId ?? undefined,
      description: this.currentNode?.data?.description,
      level: this.currentNode?.level ?? 1,
      type: this.currentNode?.data?.type?.toString() ?? '',
       entityType: this.currentNode?.data?.entityType,
    };

    console.log("🟡 Sending Account:", accountToSave);

    if (this.isEdit) {
      if (!this.currentNode.key) return;

      this.accountsService.updateAccount(+this.currentNode.key, accountToSave).subscribe({
        next: () => {
          // تحديث العقدة الحالية في الشجرة
          const updatedNode = this.findNodeByKey(this.currentNode!.key!, this.accountsTree);
          if (updatedNode) {
            updatedNode.label = accountToSave.name;
            updatedNode.data = { ...accountToSave };

            // إذا الحساب رئيسي، تحديث كل الحسابات الفرعية في الواجهة و DB
            if (!this.parentNode) {
              this.updateChildrenType(updatedNode, accountToSave.type ?? ''); // لتحديث الواجهة
              this.updateChildrenInDB(updatedNode, accountToSave.type ?? '');   // لتحديث قاعدة البيانات
            }
          }

          this.filteredTree = [...this.accountsTree]; // تحديث العرض
          this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Account updated' });
          this.cancelDialog();
        },
        error: (err) => {
          console.error('Update error:', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update account' });
        }
      });
    } else {
      // إنشاء حساب جديد
      this.accountsService.createAccount(accountToSave).subscribe({
        next: (newAccount) => {
          if (!newAccount) return;

          const newNode: MyTreeNode = {
            key: newAccount.id.toString(),
            label: newAccount.name,
            data: { ...newAccount },
            children: [],
            level: this.parentNode ? (this.parentNode.level ?? 0) + 1 : 0
          };

          if (this.parentNode) {
            this.parentNode.children = this.parentNode.children || [];
            this.parentNode.children.push(newNode);
          } else {
            this.accountsTree.push(newNode);
          }

          this.updateLevels(this.accountsTree);
          this.filteredTree = [...this.accountsTree];
          this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Account added' });
          this.cancelDialog();
        },
        error: (err) => {
          console.error('Create error:', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create account' });
        }
      });
    }
}

updateChildrenInDB(node: MyTreeNode, newType: string) {
    if (!node.children) return;

    for (const child of node.children) {
      const updatedChild: Account = {
        ...child.data,
        type: newType
      };
      this.accountsService.updateAccount(+child.key, updatedChild).subscribe();
      // تكرار للأحفاد
      this.updateChildrenInDB(child, newType);
    }
}

cancelDialog() {
    this.displayDialog = false;
    this.currentNode = null;
    this.selectedNode = null;
    this.parentNode = null;
}

deleteAccount(node: MyTreeNode | null) {
    if (!node) return;

    this.confirmationService.confirm({
      message: `Are you sure you want to delete account "${node.label ?? ''}"?`,
      accept: () => {
        if (!node.key) return;

        this.accountsService.deleteAccount(+node.key).subscribe({
          next: () => {
            this.removeNode(this.accountsTree, node);
            this.updateLevels(this.accountsTree);
            this.filteredTree = [...this.accountsTree];
            this.messageService.add({ severity: 'info', summary: 'Deleted', detail: 'Account deleted' });
            this.selectedNode = null;
          },
          error: (err) => {
            console.error('Delete error:', err);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete account' });
          }
        });
      }
    });
}

private removeNode(nodes: MyTreeNode[], target: MyTreeNode): boolean {
    const index = nodes.findIndex(n => n.key === target.key);
    if (index > -1) {
      nodes.splice(index, 1);
      return true;
    }
    for (const node of nodes) {
      if (node.children && this.removeNode(node.children, target)) return true;
    }
    return false;
  }

private generateAccountCode(parent: MyTreeNode | null): string {
  const allCodes = this.getAllCodes(this.accountsTree);

  // إذا كان الحساب رئيسي (بدون أب)
  if (!parent) {

    // الحسابات الرئيسية يجب أن تبدأ من 1 ثم 2 ثم 3 ... بلا حدود
    const mainCodes = allCodes
      .filter(code => code.length === 1)
      .map(code => Number(code));

    const nextMain = mainCodes.length > 0 ? Math.max(...mainCodes) + 1 : 1;
    return nextMain.toString();
  }

  // إذا كان الحساب فرعي ويملك أب
  const parentCode = parent.data.code.toString();

  // احضر أبناء هذا الأب فقط (وليس كل الشجرة)
  const childCodes = allCodes
    .filter(code =>
      code.startsWith(parentCode) && code.length === parentCode.length + 1
    )
    .map(code => Number(code));

  let nextChildNumber = 1;

  if (childCodes.length > 0) {
    const lastChild = Math.max(...childCodes).toString();
    const lastDigit = Number(lastChild.replace(parentCode, ""));
    nextChildNumber = lastDigit + 1;
  }

  return parentCode + nextChildNumber.toString();
}

private getAllCodes(nodes: MyTreeNode[]): string[] {
    let codes: string[] = [];
    for (const node of nodes) {
      if (node.data?.code) codes.push(node.data.code.toString());
      if (node.children) codes = codes.concat(this.getAllCodes(node.children));
    }
    return codes;
  }
}

