import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-vendors-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
  <div class="p-6 bg-white shadow-lg rounded-lg" dir="ltr">
    <p-toast></p-toast>
    <h2 class="text-3xl font-bold mb-6">Vendors Management - إدارة الموردين</h2>

    <!-- زر إضافة مورد -->
    <div class="flex justify-between items-center mb-4">
      <input type="text" pInputText [(ngModel)]="searchTerm" placeholder="Search vendor..." class="w-1/3 p-inputtext" (input)="filterVendors()" />
      <button pButton label="New Vendor" icon="pi pi-plus" class="p-button-success" (click)="openNewVendor()"></button>
    </div>

    <!-- جدول الموردين -->
    <p-table [value]="filteredVendors" [paginator]="true" [rows]="10" [responsiveLayout]="'scroll'">
      <ng-template pTemplate="header">
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Phone</th>
          <th>Email</th>
          <th>VAT No.</th>
          <th>Actions</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-vendor let-i="rowIndex">
        <tr>
          <td>{{vendor.id}}</td>
          <td>{{vendor.name}}</td>
          <td>{{vendor.phone}}</td>
          <td>{{vendor.email}}</td>
          <td>{{vendor.vat}}</td>
          <td class="flex gap-2">
            <button pButton icon="pi pi-pencil" class="p-button-info p-button-sm" (click)="editVendor(vendor)"></button>
            <button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" (click)="deleteVendor(i)"></button>
          </td>
        </tr>
      </ng-template>
    </p-table>

    <!-- Dialog إضافة/تعديل المورد -->
    <p-dialog header="{{isEdit ? 'Edit Vendor' : 'New Vendor'}}" [(visible)]="displayDialog" [modal]="true" [closable]="false" [style]="{width:'40vw'}">
      <div class="grid gap-4">
        <div>
          <label class="block mb-1 font-semibold">Vendor ID</label>
          <input type="text" [(ngModel)]="currentVendor.id" class="p-inputtext w-full bg-gray-100" readonly>
        </div>
        <div>
          <label class="block mb-1 font-semibold">Name</label>
          <input type="text" [(ngModel)]="currentVendor.name" class="p-inputtext w-full">
        </div>
        <div>
          <label class="block mb-1 font-semibold">Phone</label>
          <input type="text" [(ngModel)]="currentVendor.phone" class="p-inputtext w-full">
        </div>
        <div>
          <label class="block mb-1 font-semibold">Email</label>
          <input type="email" [(ngModel)]="currentVendor.email" class="p-inputtext w-full">
        </div>
        <div>
          <label class="block mb-1 font-semibold">Address</label>
          <input type="text" [(ngModel)]="currentVendor.address" class="p-inputtext w-full">
        </div>
        <div>
          <label class="block mb-1 font-semibold">VAT No.</label>
          <input type="text" [(ngModel)]="currentVendor.vat" class="p-inputtext w-full">
        </div>
      </div>

      <div class="mt-4 flex justify-end gap-2">
        <button pButton label="Cancel" icon="pi pi-times" class="p-button-secondary" (click)="displayDialog=false"></button>
        <button pButton label="Save" icon="pi pi-check" class="p-button-success" (click)="saveVendor()"></button>
      </div>
    </p-dialog>

    <p-confirmDialog></p-confirmDialog>
  </div>
  `
})
export class VendorsManager implements OnInit {
  vendors: any[] = [];
  filteredVendors: any[] = [];
  currentVendor: any = {};
  displayDialog = false;
  isEdit = false;
  searchTerm = '';

  constructor(private messageService: MessageService, private confirmationService: ConfirmationService) {}

  ngOnInit() {
    // بيانات مبدئية
    this.vendors = [
      { id: 1001, name: 'ABC Supplies', phone: '0501234567', email: 'abc@supplies.com', address: 'Riyadh', vat: '300123456700003' },
      { id: 1002, name: 'XYZ Trading', phone: '0507654321', email: 'xyz@trading.com', address: 'Jeddah', vat: '300987654300009' }
    ];
    this.filteredVendors = [...this.vendors];
  }

  openNewVendor() {
    this.isEdit = false;
    const lastId = this.vendors.length > 0 ? Math.max(...this.vendors.map(v => v.id)) : 1000;
    this.currentVendor = { id: lastId + 1, name: '', phone: '', email: '', address: '', vat: '' };
    this.displayDialog = true;
  }

  editVendor(vendor: any) {
    this.isEdit = true;
    this.currentVendor = { ...vendor };
    this.displayDialog = true;
  }

  saveVendor() {
    if (!this.currentVendor.name) {
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Vendor name is required' });
      return;
    }

    if (this.isEdit) {
      const index = this.vendors.findIndex(v => v.id === this.currentVendor.id);
      this.vendors[index] = { ...this.currentVendor };
      this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Vendor updated' });
    } else {
      this.vendors.push({ ...this.currentVendor });
      this.messageService.add({ severity: 'success', summary: 'Added', detail: 'Vendor added' });
    }

    this.filteredVendors = [...this.vendors];
    this.displayDialog = false;
  }

  deleteVendor(index: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this vendor?',
      accept: () => {
        this.vendors.splice(index, 1);
        this.filteredVendors = [...this.vendors];
        this.messageService.add({ severity: 'info', summary: 'Deleted', detail: 'Vendor deleted' });
      }
    });
  }

  filterVendors() {
    const term = this.searchTerm.toLowerCase();
    this.filteredVendors = this.vendors.filter(v =>
      v.name.toLowerCase().includes(term) ||
      v.phone.includes(term) ||
      v.email.toLowerCase().includes(term) ||
      v.vat.includes(term)
    );
  }
}
