import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { TagModule } from 'primeng/tag';
import * as XLSX from 'xlsx';

interface Supplier {
  code: string;
  name: string;
  totalPaid: number;
  debit: number;
  credit: number;
  balance: number;
  status: string;

  openingBalance?: string;
  openingValue?: string;
  startDate?: string;
  phone?: string;
  email?: string;
  taxNumber?: string;
  country?: string;
  city?: string;
  region?: string;
  district?: string;
  street?: string;
  buildingNo?: string;
  postalCode?: string;
  additionalNo?: string;

  // خصائص للتحقق من صحة الحقول
  invalidName?: boolean;
  invalidCode?: boolean;
}

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    FileUploadModule,
    TagModule
  ],
  template: `
<div class="card p-4 shadow-md rounded-xl bg-white">

  <div class="flex flex-wrap justify-between items-center mb-4 gap-2">
    <h2 class="text-xl font-semibold text-gray-700">Suppliers</h2>
    <div class="flex gap-2">
      <button pButton label="Upload Suppliers" icon="pi pi-upload" class="p-button-warning" (click)="openSupplierUpload()"></button>
      <button pButton label="Add Supplier" icon="pi pi-plus" class="p-button-success" (click)="openNewSupplier()"></button>
    </div>
  </div>

  <!-- Search -->
  <div class="flex flex-wrap justify-between items-center mb-3 gap-2">
    <input pInputText #filterInput placeholder="Search suppliers..." 
           (input)="onGlobalFilter(dt, $event)" class="w-full md:w-1/3">
  </div>

  <!-- Suppliers Table -->
  <p-table #dt [value]="suppliers" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[10,20,50]"
           [showGridlines]="true" responsiveLayout="scroll"
           [globalFilterFields]="['code','name','status']">

    <ng-template pTemplate="header">
      <tr class="bg-gray-100 text-gray-700 text-sm">
        <th>Supplier Code</th>
        <th>Supplier Name</th>
        <th>Total Paid</th>
        <th>Debit</th>
        <th>Credit</th>
        <th>Balance</th>
        <th>Status</th>
        <th style="width: 120px;">Actions</th>
      </tr>
    </ng-template>

    <ng-template pTemplate="body" let-s>
      <tr class="hover:bg-gray-50">
        <td>{{s.code}}</td>
        <td>{{s.name}}</td>
        <td>{{s.totalPaid}}</td>
        <td>{{s.debit}}</td>
        <td>{{s.credit}}</td>
        <td>{{s.balance}}</td>
        <td><p-tag [value]="s.status" [severity]="getSeverity(s.status)"></p-tag></td>
        <td class="flex gap-2 justify-center">
          <button pButton icon="pi pi-pencil" class="p-button-info p-button-sm" (click)="editSupplier(s)"></button>
          <button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" (click)="deleteSupplier(s)"></button>
        </td>
      </tr>
    </ng-template>
  </p-table>

  <!-- Add/Edit Supplier -->
  <p-dialog header="Add / Edit Supplier" [(visible)]="displayDialog" [modal]="true" [style]="{width:'500px'}" [closable]="false">
    <div class="space-y-4 p-4">
      <div>
        <label>Supplier Code</label>
        <input pInputText [(ngModel)]="currentSupplier.code" class="w-full p-2 border rounded"
               [ngClass]="{'border-red-500': isInvalidField(currentSupplier, 'code')}"/>
      </div>
      <div>
        <label>Supplier Name</label>
        <input pInputText [(ngModel)]="currentSupplier.name" class="w-full p-2 border rounded"
               [ngClass]="{'border-red-500': isInvalidField(currentSupplier, 'name')}"/>
      </div>
      <div>
        <label>Status</label>
        <input pInputText [(ngModel)]="currentSupplier.status" class="w-full p-2 border rounded">
      </div>
    </div>
    <ng-template pTemplate="footer">
      <button pButton label="Cancel" icon="pi pi-times" class="p-button-secondary" (click)="displayDialog=false"></button>
      <button pButton label="Save" icon="pi pi-check" class="p-button-success" (click)="saveSupplier()"
              [disabled]="isInvalidField(currentSupplier,'name') || isInvalidField(currentSupplier,'code')"></button>
    </ng-template>
  </p-dialog>

  <!-- Upload Excel -->
  <p-dialog 
    header="Import Suppliers" 
    [(visible)]="displaySupplierUpload" 
    [modal]="true" 
    [closable]="false" 
    [dismissableMask]="false" 
    [style]="{width:'750px'}"
  >
  <div class="relative p-5 text-right">

    <!-- Dotted line connecting steps -->
    <div class="absolute right-[1.85rem] top-[2.7rem] w-0 h-[82%] border-r-2 border-dotted border-gray-300 z-0"></div>

    <!-- Step 1 -->
    <div class="relative pl-8 mb-10">
      <div class="absolute -right-0 top-0 w-8 h-8 rounded-full bg-white border border-gray-400 flex items-center justify-center text-gray-700 font-semibold z-10">
        1
      </div>
      <div class="pr-10">
        <h3 class="font-semibold text-gray-800 mb-2">Download Import Template</h3>
        <button 
          pButton 
          label="Supplier Import Template" 
          icon="pi pi-download" 
          class="p-button-sm p-button-success"
          (click)="downloadTemplate()">
        </button>
      </div>
    </div>

    <!-- Step 2 -->
    <div class="relative pl-8 mb-10">
      <div class="absolute -right-0 top-0 w-8 h-8 rounded-full bg-white border border-gray-400 flex items-center justify-center text-gray-700 font-semibold z-10">
        2
      </div>
      <div class="pr-10">
        <h3 class="font-semibold text-gray-800 mb-2">Fill in Your Suppliers Data</h3>
        <p class="text-gray-600 text-sm mb-3 leading-relaxed">
          To ensure successful import, follow the instructions in the template found on the "Pre-Import Instructions" section of the template.
        </p>
        <div class="flex flex-wrap gap-2">
          <button pButton label="Watch Import Instructions Video" icon="pi pi-video" class="p-button-text"></button>
          <button pButton label="Read Instructions in Detail" icon="pi pi-info-circle" class="p-button-text"></button>
        </div>
      </div>
    </div>

    <!-- Step 3 -->
    <div class="relative pl-8 mb-4">
      <div class="absolute -right-0 top-0 w-8 h-8 rounded-full bg-white border border-gray-400 flex items-center justify-center text-gray-700 font-semibold z-10">
        3
      </div>
      <div class="pr-10">
        <h3 class="font-semibold text-gray-800 mb-3">Upload the Filled Template Here</h3>

        <div class="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center bg-gray-50 hover:bg-gray-100 transition">
          <i class="pi pi-upload text-3xl text-gray-400 mb-3"></i>
          <p class="text-gray-700 mb-1">Drag & Drop your file here to import</p>
          <p class="text-gray-500 text-sm mb-4">
            Accepted format: (.xlsx)<br>
            Max suppliers per file: 1000
          </p>
          <p-fileUpload 
            mode="basic" 
            name="file" 
            accept=".xlsx" 
            chooseLabel="Browse Files"
            [auto]="false"
            (onSelect)="handleSupplierFile($event)">
          </p-fileUpload>
        </div>
      </div>
    </div>

  </div>

  <ng-template pTemplate="footer">
    <div class="flex justify-between w-full">
      <button 
        pButton 
        label="Cancel" 
        icon="pi pi-times" 
        class="p-button-text p-button-secondary"
        (click)="displaySupplierUpload = false">
      </button>
      <button 
        pButton 
        label="Next" 
        icon="pi pi-arrow-left" 
        class="p-button-success">
      </button>
    </div>
  </ng-template>
</p-dialog>

  <!-- Excel Data Preview -->
  <p-dialog header="Uploaded Suppliers Data" [(visible)]="displayExcelPopup" 
          [modal]="true" [closable]="true" 
          [style]="{width:'95%', maxWidth:'1200px'}">

  <div *ngIf="excelSuppliers.length > 0" class="overflow-auto max-h-[500px]">
    <table class="min-w-max text-sm border border-gray-200 rounded-lg table-auto">
      <thead class="bg-gray-100 sticky top-0 z-10">
        <tr>
          <th class="p-2 text-right">Supplier Code</th>
          <th class="p-2 text-right">Supplier Name</th>
          <th class="p-2 text-right">Opening Balance</th>
          <th class="p-2 text-right">Opening Value</th>
          <th class="p-2 text-right">Start Date</th>
          <th class="p-2 text-right">Phone</th>
          <th class="p-2 text-right">Email</th>
          <th class="p-2 text-right">Tax Number</th>
          <th class="p-2 text-right">Country</th>
          <th class="p-2 text-right">City</th>
          <th class="p-2 text-right">Region</th>
          <th class="p-2 text-right">District</th>
          <th class="p-2 text-right">Street</th>
          <th class="p-2 text-right">Building No</th>
          <th class="p-2 text-right">Postal Code</th>
          <th class="p-2 text-right">Additional No</th>
          <th class="p-2 text-center">Remove</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let s of excelSuppliers" class="hover:bg-blue-50">
          <td class="p-1 text-right">
            <input pInputText [(ngModel)]="s.code" class="w-full"
                   [ngClass]="{'border-red-500': isInvalidField(s,'code')}"/>
          </td>
          <td class="p-1 text-right">
            <input pInputText [(ngModel)]="s.name" class="w-full"
                   [ngClass]="{'border-red-500': isInvalidField(s,'name')}"/>
          </td>
          <td class="p-1 text-right"><input pInputText [(ngModel)]="s.openingBalance" class="w-full"></td>
          <td class="p-1 text-right"><input pInputText [(ngModel)]="s.openingValue" class="w-full"></td>
          <td class="p-1 text-right"><input pInputText [(ngModel)]="s.startDate" class="w-full"></td>
          <td class="p-1 text-right"><input pInputText [(ngModel)]="s.phone" class="w-full"></td>
          <td class="p-1 text-right"><input pInputText [(ngModel)]="s.email" class="w-full"></td>
          <td class="p-1 text-right"><input pInputText [(ngModel)]="s.taxNumber" class="w-full"></td>
          <td class="p-1 text-right"><input pInputText [(ngModel)]="s.country" class="w-full"></td>
          <td class="p-1 text-right"><input pInputText [(ngModel)]="s.city" class="w-full"></td>
          <td class="p-1 text-right"><input pInputText [(ngModel)]="s.region" class="w-full"></td>
          <td class="p-1 text-right"><input pInputText [(ngModel)]="s.district" class="w-full"></td>
          <td class="p-1 text-right"><input pInputText [(ngModel)]="s.street" class="w-full"></td>
          <td class="p-1 text-right"><input pInputText [(ngModel)]="s.buildingNo" class="w-full"></td>
          <td class="p-1 text-right"><input pInputText [(ngModel)]="s.postalCode" class="w-full"></td>
          <td class="p-1 text-right"><input pInputText [(ngModel)]="s.additionalNo" class="w-full"></td>
          <td class="p-1 text-center">
            <button pButton icon="pi pi-times" class="p-button-danger p-button-rounded p-button-sm" (click)="removeExcelSupplier(s)"></button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <ng-template pTemplate="footer">
    <button pButton label="Close" icon="pi pi-times" class="p-button-secondary" (click)="closeExcelPopup()"></button>
    <button pButton label="Import Suppliers" icon="pi pi-check" class="p-button-success" 
            [disabled]="canImportExcel()" (click)="saveExcelSuppliers()"></button>
  </ng-template>
</p-dialog>

</div>

  `
})
export class SuppliersComponent implements OnInit {
  @ViewChild('filterInput') filterInput!: ElementRef;

  suppliers: Supplier[] = [];
  currentSupplier: Supplier = { code:'', name:'', totalPaid:0, debit:0, credit:0, balance:0, status:'نشط' };

  displayDialog: boolean = false;
  displaySupplierUpload: boolean = false;
  displayExcelPopup: boolean = false;
  excelSuppliers: Supplier[] = [];

  ngOnInit() {
    this.suppliers = [
      { code:'S001', name:'مؤسسة النور', totalPaid:5000, debit:2000, credit:1500, balance:1500, status:'نشط' },
      { code:'S002', name:'شركة السريع', totalPaid:3000, debit:1000, credit:500, balance:1500, status:'نشط' }
    ];
  }

  onGlobalFilter(table: Table, event: Event) {
    const input = event.target as HTMLInputElement | null;
    table.filterGlobal(input?.value ?? '', 'contains');
  }

  getSeverity(status: string) {
    switch (status.toLowerCase()) {
      case 'نشط': return 'success';
      case 'موقوف': return 'warn';
      default: return 'info';
    }
  }

  isInvalidField(s: Supplier, field: 'name' | 'code'): boolean {
    return field === 'name' ? !s.name?.trim() : !s.code?.trim();
  }

  canImportExcel(): boolean {
    return this.excelSuppliers.some(s => !s.name || !s.code);
  }

  openNewSupplier() {
    this.displayDialog = true;
    this.currentSupplier = { code:'', name:'', totalPaid:0, debit:0, credit:0, balance:0, status:'نشط' };
  }

  editSupplier(s: Supplier) {
    this.displayDialog = true;
    this.currentSupplier = { ...s };
  }

  saveSupplier() {
    const index = this.suppliers.findIndex(x => x.code === this.currentSupplier.code);
    if (index > -1) this.suppliers[index] = { ...this.currentSupplier };
    else this.suppliers.push({ ...this.currentSupplier });
    this.displayDialog = false;
  }

  deleteSupplier(s: Supplier) {
    this.suppliers = this.suppliers.filter(x => x.code !== s.code);
  }

  openSupplierUpload() {
    this.displaySupplierUpload = true;
    this.excelSuppliers = [];
  }

  downloadTemplate() {
    const data = [{
      "اسم المورد *": "المراعي",
      "رمز المورد *": "001",
      "الرصيد الافتتاحي": "$1,000.00",
      "قيمة الرصيد الافتتاحي": "$1,000.00",
      "اعتبارًا من تاريخ": "01/01/2025",
      "رقم الجوال": "0512345678",
      "البريد الإلكتروني": "adac@cdsc.com",
      "الرقم الضريبي": "303030303030303",
      "الدولة (اختر من القائمة)": "المملكة العربية السعودية",
      "المدينة": "الرياض",
      "المنطقة": "الرياض",
      "الحي": "الملقا",
      "اسم الشارع": "انس بن مالك",
      "رقم المبنى": "12345",
      "الرمز البريدي": "15523",
      "الرقم الإضافي": "15523"
    }];

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'نموذج الموردين');
    XLSX.writeFile(wb, 'supplier-template.xlsx');
  }

  handleSupplierFile(event: any) {
    const file = event.files[0];
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      this.excelSuppliers = jsonData.map(row => ({
        name: row['اسم المورد *']?.toString().trim() || '',
        code: row['رمز المورد *']?.toString().trim() || '',
        openingBalance: row['الرصيد الافتتاحي']?.toString().trim() || '',
        openingValue: row['قيمة الرصيد الافتتاحي']?.toString().trim() || '',
        startDate: row['اعتبارًا من تاريخ']?.toString().trim() || '',
        phone: row['رقم الجوال']?.toString().trim() || '',
        email: row['البريد الإلكتروني']?.toString().trim() || '',
        taxNumber: row['الرقم الضريبي']?.toString().trim() || '',
        country: row['الدولة (اختر من القائمة)']?.toString().trim() || '',
        city: row['المدينة']?.toString().trim() || '',
        region: row['المنطقة']?.toString().trim() || '',
        district: row['الحي']?.toString().trim() || '',
        street: row['اسم الشارع']?.toString().trim() || '',
        buildingNo: row['رقم المبنى']?.toString().trim() || '',
        postalCode: row['الرمز البريدي']?.toString().trim() || '',
        additionalNo: row['الرقم الإضافي']?.toString().trim() || '',
        totalPaid: 0, debit: 0, credit: 0, balance: 0, status: 'نشط'
      }));
      this.displayExcelPopup = true;
      this.displaySupplierUpload = false;
    };

    reader.readAsArrayBuffer(file);
  }

  removeExcelSupplier(s: Supplier) {
    this.excelSuppliers = this.excelSuppliers.filter(x => x !== s);
  }

  closeExcelPopup() {
    this.displayExcelPopup = false;
    this.excelSuppliers = [];
  }

  saveExcelSuppliers() {
    this.suppliers = [...this.suppliers, ...this.excelSuppliers];
    this.closeExcelPopup();
  }
}
