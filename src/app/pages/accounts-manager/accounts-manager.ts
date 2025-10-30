import { Component, OnInit } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TreeModule } from 'primeng/tree';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AccountsService, Account } from '@/apiservice/accounts.service';
import { HttpClientModule } from '@angular/common/http';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectButtonModule } from 'primeng/selectbutton';
import { Select } from "primeng/select";

// توسيع TreeNode لدعم level
interface MyTreeNode extends TreeNode {
  level?: number;
  children?: MyTreeNode[];
}

@Component({
  selector: 'app-accounts-manager',
  standalone: true,
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
  template: `
<div class="card p-4 bg-gray-900 text-gray-100 rounded-lg shadow-lg">

  <p-toast></p-toast>
  <h2 class="text-3xl font-bold mb-6">Accounts Management</h2>

  <!-- Search -->
  <div class="mb-4">
    <input type="text" pInputText placeholder="Search by name or code..." [(ngModel)]="searchTerm"
      class="w-full border p-2 rounded" (input)="filterAccounts()" />
  </div>

  <!-- Buttons -->
  <div class="flex flex-wrap gap-3 mb-4">
    <button pButton icon="pi pi-plus" class="p-button-success" (click)="openNewAccount(null)"
      pTooltip="إضافة حساب رئيسي جديد" tooltipPosition="top"></button>

    <button pButton icon="pi pi-plus-circle" class="p-button-warning"
      [disabled]="!selectedNode" (click)="openNewAccount(selectedNode)"
      pTooltip="إضافة حساب فرعي للحساب المحدد" tooltipPosition="top"></button>

    <button pButton icon="pi pi-pencil" class="p-button-info"
      [disabled]="!selectedNode" (click)="openEditAccount(selectedNode)"
      pTooltip="تعديل الحساب المحدد" tooltipPosition="top"></button>

    <button pButton icon="pi pi-trash" class="p-button-danger"
      [disabled]="!selectedNode" (click)="deleteAccount(selectedNode)"
      pTooltip="حذف الحساب المحدد" tooltipPosition="top"></button>
  </div>

  <!-- Tree -->
  <div class="bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-700">
    <div class="max-h-[400px] overflow-y-auto custom-scroll">
      <p-tree
        [value]="filteredTree"
        selectionMode="single"
        [(selection)]="selectedNode"
        (onNodeSelect)="onNodeSelect($event)"
        (onNodeExpand)="onNodeExpand($event)"
        [style]="{ width: '100%' }">

        <ng-template let-node pTemplate="default">
          <div 
            class="flex justify-between items-center p-2 transition-all rounded cursor-pointer"
            [ngClass]="{
              'bg-gray-700 text-white': selectedNode === node,
              'hover:bg-gray-600 hover:text-white': selectedNode !== node
            }"
            [ngStyle]="{'padding-left.px': (node.level ?? 0) * 20}">
            <span class="font-medium">{{ node.label ?? '' }}</span>
            <span class="font-mono text-gray-400"> - {{ node.data?.code ?? '-' }}</span>
          </div>
        </ng-template>
      </p-tree>
    </div>
  </div>

  <!-- Dialog -->
  <p-dialog *ngIf="currentNode" header="{{isEdit ? 'Edit Account' : 'New Account'}}" 
          [(visible)]="displayDialog" [modal]="true" [closable]="false" [style]="{width:'500px'}">
    <div class="grid grid-cols-2 gap-4">

      <div class="col-span-2">
        <label class="block mb-1 font-semibold text-gray-700">Account Name</label>
        <input type="text" pInputText [(ngModel)]="currentNode.label" class="w-full border p-2 rounded" />
      </div>

      <div>
        <label class="block mb-1 font-semibold text-gray-700">Account Code</label>
        <input type="text" pInputText [(ngModel)]="currentNode.data.code" class="w-full border p-2 rounded" [readonly]="true" />
      </div>

      <div>
  <label class="block mb-1 font-semibold text-gray-700">Type</label>
  <p-select 
    [options]="accountTypes" 
    [(ngModel)]="currentNode.data.type" 
    optionLabel="label" 
    class="w-full">
  </p-select>
</div>


      <div>
        <label class="block mb-1 font-semibold text-gray-700">Currency</label>
        <input type="text" pInputText [(ngModel)]="currentNode.data.currency" class="w-full border p-2 rounded" />
      </div>

      <div class="col-span-2">
        <label class="block mb-1 font-semibold text-gray-700">Description</label>
        <input type="text" pInputText [(ngModel)]="currentNode.data.description" class="w-full border p-2 rounded" />
      </div>

      <div class="flex items-center gap-2">
        <p-checkbox [(ngModel)]="currentNode.data.active" binary="true"></p-checkbox>
        <label>Active</label>
      </div>

      <div class="flex items-center gap-2">
        <p-checkbox [(ngModel)]="currentNode.data.autoRollover" binary="true"></p-checkbox>
        <label>Auto Rollover</label>
      </div>

      <div class="flex items-center gap-2">
        <p-checkbox [(ngModel)]="currentNode.data.allowTransactions" binary="true"></p-checkbox>
        <label>Allow Transactions</label>
      </div>

      <div>
        <label class="block mb-1 font-semibold text-gray-700">Default Tax Id</label>
        <input type="number" pInputText [(ngModel)]="currentNode.data.defaultTaxId" class="w-full border p-2 rounded" />
      </div>

      <div>
        <label class="block mb-1 font-semibold text-gray-700">Balance Type</label>
        <input type="text" pInputText [(ngModel)]="currentNode.data.balanceType" class="w-full border p-2 rounded" />
      </div>
    </div>

    <div class="flex justify-end gap-3 mt-4">
      <button pButton label="Cancel" class="p-button-secondary" (click)="cancelDialog()"></button>
      <button pButton label="Save" class="p-button-success" (click)="saveAccount()"></button>
    </div>
  </p-dialog>

  <p-confirmDialog></p-confirmDialog>
</div>
  `
})
export class AccountsManager implements OnInit {
  accountsTree: MyTreeNode[] = [];
  filteredTree: MyTreeNode[] = [];
  selectedNode: MyTreeNode | null = null;
  accountTypes = [
    { label: 'Revenue', value: 'Revenue' },
    { label: 'Expense', value: 'Expense' },
    { label: 'Asset', value: 'Asset' },
    { label: 'Liability', value: 'Liability' },
    { label: 'Equity', value: 'Equity' }
  ];


  displayDialog = false;
  isEdit = false;
  currentNode: MyTreeNode | null = null;
  parentNode: MyTreeNode | null = null;

  searchTerm: string = '';

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private accountsService: AccountsService
  ) { }

  ngOnInit() {
    this.loadAccounts();
  }

  loadAccounts() {
    this.accountsService.getAccounts().subscribe((accounts: Account[]) => {
      this.accountsTree = this.mapAccountsToTreeNodes(accounts);
      this.filteredTree = [...this.accountsTree];
      this.updateLevels(this.filteredTree);
    });
  }

  private mapAccountsToTreeNodes(accounts: Account[], level: number = 0): MyTreeNode[] {
    const mapNode = (acc: Account, lvl: number): MyTreeNode => ({
      key: acc.id.toString(),
      label: acc.name,
      data: { ...acc, code: acc.code },
      children: acc.children ? acc.children.map(c => mapNode(c, lvl + 1)) : [],
      level: lvl
    });

    return accounts.map(acc => mapNode(acc, level));
  }

  private updateLevels(nodes: MyTreeNode[], level: number = 0) {
    for (const node of nodes) {
      node.level = level;
      if (node.children) this.updateLevels(node.children, level + 1);
    }
  }

  filterAccounts() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredTree = [...this.accountsTree];
      this.updateLevels(this.filteredTree);
      return;
    }

    const filterNodes = (nodes: MyTreeNode[], lvl: number = 0): MyTreeNode[] => nodes
      .map(node => {
        const children = node.children ? filterNodes(node.children, lvl + 1) : [];
        const match = (node.label ?? '').toLowerCase().includes(term) || (node.data?.code ?? '').includes(term);
        if (match || children.length > 0) {
          return { ...node, children, level: lvl };
        }
        return null;
      })
      .filter(n => n !== null) as MyTreeNode[];

    this.filteredTree = filterNodes(this.accountsTree);
  }

  onNodeSelect(event: any) {
    this.selectedNode = event.node;
  }

  openNewAccount(parent: TreeNode | null) {
    this.isEdit = false;
    const code = this.generateAccountCode(parent);

    this.currentNode = {
      label: '',
      data: { code },
      children: []
    };
    this.parentNode = parent;
    this.displayDialog = true;
  }

  openEditAccount(node: MyTreeNode | null) {
    if (!node) return;
    this.isEdit = true;
    this.currentNode = {
      label: node.label ?? '',
      data: { ...node.data },
      children: node.children ? [...node.children] : [],
      level: node.level
    };
    this.parentNode = this.findParentNode(node.key!, this.accountsTree);
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

  saveAccount() {
    if (!this.currentNode || !this.currentNode.label || !this.currentNode.data?.code) {
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Please enter name and code' });
      return;
    }

    const accountToSave: Account = {
      id: this.isEdit && this.selectedNode ? +this.selectedNode.key! : 0,
      name: this.currentNode.label,
      code: this.currentNode.data.code,
      parentId: this.parentNode ? +this.parentNode.key! : undefined
    };

    if (this.isEdit) {
      if (!this.selectedNode) return;

      this.accountsService.updateAccount(+this.selectedNode.key!, accountToSave).subscribe({
        next: () => {
          this.loadAccounts();
          this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Account updated' });
          this.cancelDialog();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update account' });
          console.error('Update error:', err);
        }
      });
    } else {
      this.accountsService.createAccount(accountToSave).subscribe({
        next: (newAccount) => {
          if (!newAccount) return;

          const newNode: MyTreeNode = {
            key: newAccount.id.toString(),
            label: newAccount.name,
            data: { code: newAccount.code },
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
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create account' });
          console.error('Create error:', err);
        }
      });
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
      message: `Are you sure you want to delete account "${node.label}"?`,
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
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete account' });
            console.error('Delete error:', err);
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

  onNodeExpand(event: any) {
    const expandedNode = event.node;
    if (this.filteredTree.includes(expandedNode)) {
      for (const node of this.filteredTree) {
        if (node !== expandedNode) node.expanded = false;
      }
    }
  }

  private generateAccountCode(parent: TreeNode | null): string {
    const pad = (num: number, length: number = 4) => num.toString().padStart(length, '0');

    if (!parent) {
      const mainCodes = this.accountsTree.map(a => Number(a.data?.code) || 1000);
      const lastCode = mainCodes.length > 0 ? Math.max(...mainCodes) : 1000;
      return pad(lastCode + 1);
    } else {
      const children = parent.children || [];
      const childCodes = children.map(c => Number(c.data?.code.split('.').pop()) || 0);
      const lastChildCode = childCodes.length > 0 ? Math.max(...childCodes) : 0;
      return `${parent.data?.code}.${pad(lastChildCode + 1, 2)}`;
    }
  }
}
