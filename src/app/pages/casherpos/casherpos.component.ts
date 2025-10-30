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
import { Select } from 'primeng/select';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InvoiceService } from '../service/invoice.service';

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

  clientName = 'Walk-in Client';
  currentDateTime = '';
  products: Product[] = [];

  discount = 0;
  vatRate = 15;
  total = 0;
  vatAmount = 0;
  grandTotal = 0;

  selectedCustomer: Customer = { name: 'John Doe', phone: '1234567890', email: 'john@example.com', taxNumber: '123-456-789' };

  clients: Customer[] = [
    { name: 'عميل 1' },
    { name: 'عميل 2' },
    { name: 'عميل 3' }
  ];
  selectedClient: Customer | null = null;

  showAddClientDialog = false;
  newClient: Customer = { name: '', phone: '', email: '', taxNumber: '' };

  private dateInterval!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private invoiceService: InvoiceService,
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
    this.currentDateTime = now.toLocaleString('ar-EG', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  addProduct() {
    this.products.push({ name: `منتج ${this.products.length + 1}`, qty: 1, price: 10 });
    this.calculateTotals();
     this.messageService.clear();
    this.messageService.add({ severity: 'success', summary: 'تمت الإضافة', detail: 'تمت إضافة منتج جديد بنجاح'  });
     
  }

  removeProduct(index: number) {
    this.products.splice(index, 1);
    this.calculateTotals();
     this.messageService.clear();
    this.messageService.add({ severity: 'success', summary: 'تم الحذف', detail: 'تم حذف المنتج من القائمة' });

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
     this.messageService.clear();
    this.messageService.add({ severity: 'success', summary: 'تم المسح', detail: 'تم حذف جميع العناصر' });
  }

  trackByIndex(index: number, item: Product) {
    return index;
  }

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
       this.messageService.clear();
      this.messageService.add({ severity: 'success', summary: 'تمت الإضافة', detail: 'تمت إضافة العميل الجديد' });
    }
  }

  // ===== حفظ وطباعة الفاتورة =====
  payInvoice() {
    if (!this.selectedClient) {
       this.messageService.clear();
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'الرجاء اختيار عميل أولاً!' });
      return;
    }

    const invoiceData = {
      client: this.selectedClient,
      items: this.products.map(p => ({ name: p.name, qty: p.qty, price: p.price, total: p.qty * p.price })),
      total: this.total,
      vat: this.vatAmount,
      discount: this.discount,
      grandTotal: this.grandTotal,
      date: new Date()
    };

    this.invoiceService.saveInvoice(invoiceData).subscribe({
      next: (res: any) => {
         this.messageService.clear();
        this.messageService.add({ severity: 'success', summary: 'تم الحفظ', detail: 'تم حفظ الفاتورة بنجاح!' });
        this.printInvoice(invoiceData, res.invoiceNumber || '0001');
      },
      error: (err: any) => {
         this.messageService.clear();
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل حفظ الفاتورة!' });
        console.error('Invoice save error:', err);
      }
    });
  }

  printInvoice(invoiceData: any, invoiceNumber: string) {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('فاتورة بيع', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`رقم الفاتورة: ${invoiceNumber}`, 14, 25);
    doc.text(`التاريخ: ${new Date().toLocaleDateString('ar-EG')}`, 150, 25);
    doc.text(`العميل: ${this.selectedClient?.name}`, 14, 35);

    const tableData = invoiceData.items.map((item: any, index: number) => [
      index + 1, item.name, item.qty, item.price.toFixed(2), item.total.toFixed(2)
    ]);

    autoTable(doc, { head: [['#', 'المنتج', 'الكمية', 'السعر', 'الإجمالي']], body: tableData, startY: 45 });

    const lastY = (doc as any).lastAutoTable.finalY || 60;
    doc.text(`المجموع: ${invoiceData.total.toFixed(2)} ريال`, 14, lastY + 10);
    doc.text(`الضريبة (${this.vatRate}%): ${invoiceData.vat.toFixed(2)} ريال`, 14, lastY + 18);
    doc.text(`الخصم: ${invoiceData.discount.toFixed(2)}%`, 14, lastY + 26);
    doc.text(`الإجمالي النهائي: ${invoiceData.grandTotal.toFixed(2)} ريال`, 14, lastY + 34);

    // 🖨️ معاينة الطباعة
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  }
}
