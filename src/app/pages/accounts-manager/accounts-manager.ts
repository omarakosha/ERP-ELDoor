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
import { ConfirmationService, MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-accounts-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TreeModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
 <div class="card">
 <p-toast position="top-center" class="custom-toast"></p-toast>
  <h2 class="text-3xl font-bold mb-6">Accounts Management</h2>

  <!-- Search -->
  <div class="mb-4">
    <input type="text" pInputText placeholder="Search by name or code..." [(ngModel)]="searchTerm" class="w-full border p-2 rounded" (input)="filterAccounts()" />
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

  <!-- 🌙 Tree Dark Mode + Scroll داخلي + فتح عقدة رئيسية واحدة فقط -->
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
            [ngStyle]="{'padding-left': (node.level * 20) + 'px'}">
            
            <span class="font-medium">{{ node.label ?? '' }}</span>
            <span class="font-mono text-gray-400"> - {{ node.data?.code ?? '-' }}</span>
          </div>
        </ng-template>
      </p-tree>
    </div>
  </div>

  <!-- Dialog -->
  <p-dialog *ngIf="currentNode" header="{{isEdit ? 'Edit Account' : 'New Account'}}" 
            [(visible)]="displayDialog" [modal]="true" [closable]="false" [style]="{width:'450px'}">
    <div class="mb-4">
      <label class="block mb-1 font-semibold text-gray-700">Account Name</label>
      <input type="text" pInputText [(ngModel)]="currentNode.label" class="w-full border p-2 rounded" />
    </div>
    <div class="mb-4">
      <label class="block mb-1 font-semibold text-gray-700">Account Code</label>
      <input type="text" pInputText [(ngModel)]="currentNode.data.code" class="w-full border p-2 rounded" [readonly]="true" />
    </div>
    <div class="flex justify-end gap-3">
      <button pButton label="Cancel" class="p-button-secondary" (click)="cancelDialog()"></button>
      <button pButton label="Save" class="p-button-success" (click)="saveAccount()"></button>
    </div>
  </p-dialog>

  <p-confirmDialog></p-confirmDialog>
</div>
  `
})
export class AccountsManager implements OnInit {
  accountsTree: TreeNode[] = [];
  filteredTree: TreeNode[] = [];
  selectedNode: TreeNode | null = null;

  displayDialog = false;
  isEdit = false;
  currentNode: any = { label: '', data: { code: '' }, children: [] };
  parentNode: any = null;

  searchTerm: string = '';

  constructor(private messageService: MessageService, private confirmationService: ConfirmationService) {}

  ngOnInit() {
    this.accountsTree = [
      { key: '1', label: 'Assets', data: { code: '1000' }, children: [
        { key: '1-1', label: 'Cash', data: { code: '10001' }, children: [
          { key: '1-1-1', label: 'Petty Cash', data: { code: '1000101' } }
        ]},
        { key: '1-2', label: 'Bank', data: { code: '10002' } }
      ]},
      { key: '2', label: 'Liabilities', data: { code: '2000' }, children: [
        { key: '2-1', label: 'Suppliers', data: { code: '20001' } }
      ]}
    ];
    this.filteredTree = [...this.accountsTree];
  }

  private generateAccountCode(parent: TreeNode | null): string {
    if (!parent) {
      const lastCode = this.accountsTree.length > 0 ? Math.max(...this.accountsTree.map(a => +a.data.code)) : 0;
      return (Math.floor(lastCode/1000)+1)*1000 + '';
    } else {
      const children = parent.children ?? [];
      const parentCode = +parent.data.code;
      const lastChildCode = children.length > 0 ? Math.max(...children.map(c => +c.data.code)) : parentCode*10;
      return (lastChildCode+1).toString();
    }
  }

  filterAccounts() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredTree = [...this.accountsTree];
      return;
    }

    const filterNodes = (nodes: TreeNode[]): TreeNode[] => {
      return nodes
        .map(n => {
          const children = n.children ? filterNodes(n.children) : [];
          const match = (n.label ?? '').toLowerCase().includes(term) || (n.data?.code ?? '').includes(term);
          if (match || children.length > 0) {
            return { ...n, children };
          }
          return null;
        })
        .filter(n => n !== null) as TreeNode[];
    };

    this.filteredTree = filterNodes(this.accountsTree);
  }

  onNodeSelect(event: any) {
    this.selectedNode = event.node;
  }

  openNewAccount(parent: TreeNode | null) {
    this.isEdit = false;
    const code = this.generateAccountCode(parent);
    this.currentNode = { label: '', data: { code }, children: [] };
    this.parentNode = parent;
    this.displayDialog = true;
  }

  openEditAccount(node: TreeNode | null) {
    if (!node) return;
    this.isEdit = true;
    this.currentNode = {
      label: node.label ?? '',
      data: node.data ? { ...node.data } : { code: '' },
      children: node.children ? [...node.children] : []
    };
    this.displayDialog = true;
  }

  saveAccount() {
    if (!this.currentNode || !this.currentNode.label || !this.currentNode.data?.code) {
        this.messageService.clear();
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Please enter name and code' });
      return;
    }

    if (this.isEdit) {
      if (this.selectedNode) {
        this.selectedNode.label = this.currentNode.label;
        this.selectedNode.data = { ...this.currentNode.data };
        this.selectedNode.children = this.currentNode.children ? [...this.currentNode.children] : [];
          this.messageService.clear();
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Account updated' });
      }
    } else {
      const newNode: TreeNode = {
        ...this.currentNode,
        key: (Math.random() * 10000).toFixed(0),
        children: []
      };
      if (this.parentNode) {
        if (!this.parentNode.children) this.parentNode.children = [];
        this.parentNode.children.push(newNode);
      } else {
        this.accountsTree.push(newNode);
      }
        this.messageService.clear();
      this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Account added' });
    }

    this.filteredTree = [...this.accountsTree];
    this.cancelDialog();
  }

  cancelDialog() {
    this.displayDialog = false;
    this.currentNode = { label: '', data: { code: '' }, children: [] };
    this.selectedNode = null;
    this.parentNode = null;
  }

  deleteAccount(node: TreeNode | null) {
    if (!node) return;
    this.confirmationService.confirm({
      message: `Are you sure you want to delete account "${node.label}"?`,
      accept: () => {
        this.removeNode(this.accountsTree, node);
        this.filteredTree = [...this.accountsTree];
          this.messageService.clear();
        this.messageService.add({ severity: 'info', summary: 'Deleted', detail: 'Account deleted' });
        this.selectedNode = null;
      }
    });
  }

  private removeNode(nodes: TreeNode[], target: TreeNode) {
    const index = nodes.findIndex(n => n.key === target.key);
    if (index > -1) {
      nodes.splice(index, 1);
      return true;
    }
    for (let n of nodes) {
      if (n.children && this.removeNode(n.children, target)) return true;
    }
    return false;
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
}
