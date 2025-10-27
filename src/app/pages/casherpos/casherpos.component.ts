import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DialogModule } from 'primeng/dialog';
import { Subscription, interval } from 'rxjs';
import { Select } from "primeng/select";

interface Product {
  name: string;
  qty: number;
  price: number;
}

interface Customer {
  name: string;
  phone?: string;
  email?: string;
  taxNumber?: string;
}

@Component({
  selector: 'app-casherpos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    TableModule,
    ToastModule,
    ConfirmDialogModule,
    SelectButtonModule,
    DialogModule,
    Select
],
  providers: [ConfirmationService, MessageService],
  templateUrl: './casherpos.component.html',
  styleUrls: ['./casherpos.component.scss']
})
export class CasherposComponent implements OnInit, OnDestroy {
  clientName = 'walk-in Client';
  currentDateTime = '';
  products: Product[] = [];
  
  discount = 0;
  vatRate = 15;
  total = 0;
  vatAmount = 0;
  grandTotal = 0;

  // العميل المحدد افتراضيًا
  selectedCustomer: Customer = {
    name: 'John Doe',
    phone: '1234567890',
    email: 'john@example.com',
    taxNumber: '123-456-789'
  };

  // ===== خصائص العملاء =====
  clients: Customer[] = [
    { name: 'عميل 1', phone: '', email: '', taxNumber: '' },
    { name: 'عميل 2', phone: '', email: '', taxNumber: '' },
    { name: 'عميل 3', phone: '', email: '', taxNumber: '' }
  ];
  selectedClient: Customer | null = null;
  showAddClientDialog = false;
  newClient: Customer = { name: '', phone: '', email: '', taxNumber: '' };

  private dateInterval!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['posName']) this.clientName = params['posName'];
    });

    const saved = localStorage.getItem('products');
    if (saved) this.products = JSON.parse(saved);

    this.calculateTotals();
    this.updateDateTime();
    this.dateInterval = interval(60000).subscribe(() => this.updateDateTime());
  }

  ngOnDestroy() {
    this.dateInterval.unsubscribe();
  }

  updateDateTime() {
    const now = new Date();
    this.currentDateTime = now.toLocaleString('ar-EG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  addProduct() {
    this.products.push({
      name: `منتج ${this.products.length + 1}`,
      qty: 1,
      price: 10
    });
    this.calculateTotals();
    this.messageService.add({ severity: 'success', summary: 'تمت الإضافة', detail: 'تمت إضافة منتج جديد بنجاح' });
  }

  removeProduct(index: number) {
    this.products.splice(index, 1);
    this.calculateTotals();
    this.messageService.add({ severity: 'warn', summary: 'تم الحذف', detail: 'تم حذف المنتج من القائمة' });
  }

  calculateTotals() {
    this.total = this.products.reduce((sum, p) => sum + p.qty * p.price, 0);
    this.vatAmount = (this.total * this.vatRate) / 100;
    const discountValue = (this.total * this.discount) / 100;
    this.grandTotal = this.total + this.vatAmount - discountValue;
    localStorage.setItem('products', JSON.stringify(this.products));
  }

  confirmClearAll() {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من مسح جميع المنتجات؟',
      header: 'تأكيد المسح',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم',
      rejectLabel: 'إلغاء',
      accept: () => this.clearAll()
    });
  }

  clearAll() {
    this.products = [];
    this.calculateTotals();
    this.messageService.add({ severity: 'info', summary: 'تم المسح', detail: 'تم حذف جميع العناصر' });
  }

  trackByIndex(index: number, item: Product) {
    return index;
  }

  // ===== دوال العملاء =====
  onClientChange(event: any) {
    console.log('تم اختيار العميل:', this.selectedClient);
  }

  openAddClientDialog() {
    this.newClient = { name: '', phone: '', email: '', taxNumber: '' };
    this.showAddClientDialog = true;
  }

  addNewClient() {
    if (this.newClient.name.trim()) {
      this.clients.push({ ...this.newClient });
      this.selectedClient = { ...this.newClient };
      this.showAddClientDialog = false;
      this.messageService.add({ severity: 'success', summary: 'تمت الإضافة', detail: 'تمت إضافة العميل الجديد' });
    }
  }
}
