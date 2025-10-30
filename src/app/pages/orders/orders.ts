import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { Table, TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { TagModule } from 'primeng/tag';
import { Customer, CustomerService, Representative } from '../service/customer.service';
import { Product, ProductService } from '../service/product.service';
import { ObjectUtils } from "primeng/utils";
import { DialogModule } from 'primeng/dialog';

interface expandedRows {
    [key: string]: boolean;
}

@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [
        TableModule,
        MultiSelectModule,
        SelectModule,
        InputIconModule,
        TagModule,
        InputTextModule,
        SliderModule,
        ProgressBarModule,
        ToggleButtonModule,
        ToastModule,
        CommonModule,
        FormsModule,
        ButtonModule,
        RatingModule,
        RippleModule,
        IconFieldModule,
        DialogModule,
    ],
    
    template: `
    <div class="card">
     <p-toast position="top-center" class="custom-toast"></p-toast>
        <div class="font-semibold text-xl mb-4">Orders</div>
        
        <p-table 
            [value]="products" 
            dataKey="id" 
            [tableStyle]="{ 'min-width': '60rem' }"
            #dt 
            [expandedRowKeys]="expandedRows"
            [paginator]="true"
            [rows]="10"
            [globalFilterFields]="['id','name','category','inventoryStatus']"
            [rowsPerPageOptions]="[5,10,20]"
            (onRowExpand)="onRowExpand($event)"
            (onRowCollapse)="onRowCollapse($event)"
        >
                 
           <ng-template #caption>
              <div class="flex items-center justify-between w-full mb-2">
                <!-- زر Expand/Collapse -->
                <button pButton 
                        icon="pi pi-fw {{ isExpanded ? 'pi-minus' : 'pi-plus' }}"
                        label="{{ isExpanded ? 'Collapse All' : 'Expand All' }}" 
                        (click)="expandAll()" 
                        class="ml-4">
                </button>
                
                <!-- حقل البحث -->
                <span class="flex items-center">
                  <input pInputText type="text" 
                         (input)="onGlobalFilter(dt, $event)" 
                         placeholder="Search..." 
                         class="p-inputtext p-component" />
                </span>
              </div>
           </ng-template>

            <ng-template #header>
                <tr>
                    <th style="width: 5rem"></th>
                    <th>#</th>
                    <th pSortableColumn="name">Customer Name <p-sortIcon field="name" /></th>
                    <th pSortableColumn="price">Total Price <p-sortIcon field="price" /></th>
                    <th pSortableColumn="category">Quantity <p-sortIcon field="category" /></th>
                    <th pSortableColumn="rating">Reviews <p-sortIcon field="rating" /></th>
                    <th pSortableColumn="inventoryStatus">Order Status <p-sortIcon field="inventoryStatus" /></th>
                    <th>Actions</th>
                </tr>
            </ng-template>

            <ng-template #body let-product let-expanded="expanded">
                <tr>
                    <td>
                        <p-button type="button" pRipple 
                            [pRowToggler]="product" 
                            [text]="true" 
                            [rounded]="true"
                            [plain]="true" 
                            [icon]="expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'" />
                    </td>
                    <td>{{ product.id }}</td>
                    <td>{{ product.name }}</td>
                    <td>{{ product.price | currency: 'USD' }}</td>
                    <td>{{ product.category }}</td>
                    <td>
                        <p-rating [ngModel]="product.rating" [readonly]="true" />
                    </td>
                    <td>
                        <p-tag [value]="product.inventoryStatus" [severity]="getSeverity(product.inventoryStatus)" />
                    </td>
                    <td>
                        <p-button class="mr-2" icon="pi pi-pencil" severity="info" (onClick)="onEdit(product)"></p-button>
                        <p-button class="mr-2" icon="pi pi-trash" severity="danger" (onClick)="onDelete(product)"></p-button>
                        <p-button class="mr-2" icon="pi pi-print" severity="secondary" (onClick)="onPrint(product)"></p-button>
                    </td>
                </tr>
            </ng-template>

            <ng-template #expandedrow let-product>
                <tr>
                    <td colspan="8">
                        <div class="p-4">
                            <h5>Orders for {{ product.name }}</h5>
                            <p-table [value]="product.orders" dataKey="id">
                                <ng-template #header>
                                    <tr>
                                        <th pSortableColumn="id">Id <p-sortIcon field="id" /></th>
                                        <th pSortableColumn="Product">Product <p-sortIcon field="Product" /></th>
                                        <th pSortableColumn="date">Date <p-sortIcon field="date" /></th>
                                        <th pSortableColumn="amount">Amount <p-sortIcon field="amount" /></th>
                                        <th pSortableColumn="status">Status <p-sortIcon field="status" /></th>
                                        <th style="width: 4rem"></th>
                                    </tr>
                                </ng-template>
                                <ng-template #body let-order>
                                    <tr>
                                        <td>{{ order.id }}</td>
                                        <td>{{ order.customer }}</td>
                                        <td>{{ order.date }}</td>
                                        <td>{{ order.amount | currency: 'USD' }}</td>
                                        <td>
                                            <p-tag [value]="order.status" [severity]="getSeverity(order.status)" />
                                        </td>
                                        <td>
                                            <p-button icon="pi pi-trash" severity="danger" (onClick)="onDelete(order)" />
                                        </td>
                                    </tr>
                                </ng-template>
                                <ng-template #emptymessage>
                                    <tr>
                                        <td colspan="6">There are no orders for this product yet.</td>
                                    </tr>
                                </ng-template>
                            </p-table>
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <!-- Dialog تأكيد الحذف -->
        <p-dialog header="Confirmation" [(visible)]="displayConfirmation" 
                  [style]="{ width: '350px' }" [modal]="true">
            <div class="flex items-center justify-center">
                <i class="pi pi-exclamation-triangle mr-4" style="font-size: 2rem"></i>
                <span>Are you sure you want to delete <b>{{ selectedItem?.name || selectedItem?.id }}</b>?</span>
            </div>
            <ng-template #footer>
                <p-button label="No" icon="pi pi-times" (click)="closeConfirmation()" text severity="secondary" />
                <p-button label="Yes" icon="pi pi-check" (click)="confirmDelete()" severity="danger" outlined autofocus />
            </ng-template>
        </p-dialog>
    </div>
    `,
    styles: [`
        .p-datatable-frozen-tbody {
            font-weight: bold;
        }
        .p-datatable-scrollable .p-frozen-column {
            font-weight: bold;
        }
    `],
    providers: [ConfirmationService, MessageService, CustomerService, ProductService]
})
export class Orders implements OnInit {
    customers1: Customer[] = [];
    customers2: Customer[] = [];
    customers3: Customer[] = [];
    selectedCustomers1: Customer[] = [];
    selectedCustomer: Customer = {};
    representatives: Representative[] = [];
    statuses: any[] = [];
    products: Product[] = [];
    rowGroupMetadata: any;
    expandedRows: expandedRows = {};
    activityValues: number[] = [0, 100];
    isExpanded: boolean = false;
    balanceFrozen: boolean = false;
    loading: boolean = true;

    displayConfirmation: boolean = false;
    selectedItem: any = null;

    @ViewChild('filter') filter!: ElementRef;

    constructor(
        private customerService: CustomerService,
        private productService: ProductService,
        private messageService: MessageService
    ) { }

    ngOnInit() {
        this.customerService.getCustomersLarge().then((customers) => {
            this.customers1 = customers;
            this.loading = false;
            // @ts-ignore
            this.customers1.forEach((customer) => (customer.date = new Date(customer.date)));
        });
        this.customerService.getCustomersMedium().then((customers) => (this.customers2 = customers));
        this.customerService.getCustomersLarge().then((customers) => (this.customers3 = customers));
        this.productService.getProductsWithOrdersSmall().then((data) => (this.products = data));

        this.representatives = [
            { name: 'Amy Elsner', image: 'amyelsner.png' },
            { name: 'Anna Fali', image: 'annafali.png' },
            { name: 'Asiya Javayant', image: 'asiyajavayant.png' },
            { name: 'Bernardo Dominic', image: 'bernardodominic.png' },
            { name: 'Elwin Sharvill', image: 'elwinsharvill.png' },
            { name: 'Ioni Bowcher', image: 'ionibowcher.png' },
            { name: 'Ivan Magalhaes', image: 'ivanmagalhaes.png' },
            { name: 'Onyama Limba', image: 'onyamalimba.png' },
            { name: 'Stephen Shaw', image: 'stephenshaw.png' },
            { name: 'XuXue Feng', image: 'xuxuefeng.png' }
        ];

        this.statuses = [
            { label: 'Unqualified', value: 'unqualified' },
            { label: 'Qualified', value: 'qualified' },
            { label: 'New', value: 'new' },
            { label: 'Negotiation', value: 'negotiation' },
            { label: 'Renewal', value: 'renewal' },
            { label: 'Proposal', value: 'proposal' }
        ];
    }

    // ✅ فتح صف واحد فقط بالسهام
    onRowExpand(event: any) {
        this.expandedRows = {};
        this.expandedRows[event.data.id] = true;
    }

    onRowCollapse(event: any) {
        delete this.expandedRows[event.data.id];
    }

    expandAll() {
        if (ObjectUtils.isEmpty(this.expandedRows)) {
            this.expandedRows = this.products.reduce(
                (acc, p) => {
                    if (p.id) {
                        acc[p.id] = true;
                    }
                    return acc;
                },
                {} as { [key: string]: boolean }
            );
            this.isExpanded = true;
        } else {
            this.collapseAll();
        }
    }

    collapseAll() {
        this.expandedRows = {};
        this.isExpanded = false;
    }

    onGlobalFilter(table: Table, event: Event) {
        const value = (event.target as HTMLInputElement).value;
        table.filterGlobal(value, 'contains');
    }

    getSeverity(status: string) {
        switch (status) {
            case 'qualified':
            case 'instock':
            case 'INSTOCK':
            case 'DELIVERED':
            case 'delivered':
                return 'success';
            case 'negotiation':
            case 'lowstock':
            case 'LOWSTOCK':
            case 'PENDING':
            case 'pending':
                return 'warn';
            case 'unqualified':
            case 'outofstock':
            case 'OUTOFSTOCK':
            case 'CANCELLED':
            case 'cancelled':
                return 'danger';
            default:
                return 'info';
        }
    }

   
    onDelete(item: any) {
        this.selectedItem = item;
        this.displayConfirmation = true;
    }

  

    // ✏️ تعديل عنصر
onEdit(item: any) {
    this.messageService.clear();
    this.messageService.add({
        severity: 'success',
        summary: 'تعديل عنصر',
        detail: ` تعديل العنصر: ${item.name || item.id}`,
        life: 3000,
        closable: false
    });
}

// 🖨️ طباعة عنصر
onPrint(item: any) {
    this.messageService.clear();
    this.messageService.add({
        severity: 'success',
        summary: 'طباعة عنصر',
        detail: ` طباعة بيانات العنصر: ${item.name || item.id}`,
        life: 3000,
        closable: false
    });
}

// 🗑️ حذف عنصر بعد التأكيد
confirmDelete() {
    if (!this.selectedItem) return;

    this.messageService.clear();
    this.messageService.add({
        severity: 'success',
        summary: 'حذف عنصر',
        detail: ` تم حذف العنصر: ${this.selectedItem.name || this.selectedItem.id}`,
        life: 3000,
        closable: false
    });

    this.displayConfirmation = false;
    this.selectedItem = null;
}

 closeConfirmation() {
        this.displayConfirmation = false;
        this.selectedItem = null;
    }
}