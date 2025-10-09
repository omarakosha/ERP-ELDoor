import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { ProductService, Product } from '../service/product.service';
import { CurrencyPipe } from '@angular/common';

interface CartItem {
  product: Product;
  qty: number;
  price: number; // unit price (could be product.price)
  lineTotal: number;
}

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    BadgeModule,
    DialogModule,
    InputNumberModule,
    ToastModule
  ],
  template: `
  <div class="p-4" dir="rtl" style="min-height:600px">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-semibold">شاشة البيع</h2>
      <div class="flex gap-3 items-center">
        <button pButton label="قائمة الفواتير" icon="pi pi-list" class="p-button-outlined"></button>
        <button pButton label="إعدادات" icon="pi pi-cog" class="p-button-text"></button>
      </div>
    </div>

    <!-- Search / Scanner -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div class="col-span-2">
        <span class="p-input-icon-left w-full">
          <i class="pi pi-search"></i>
          <input #scannerInput pInputText type="text"
                 [(ngModel)]="searchText"
                 (keydown.enter)="onScanEnter()"
                 placeholder="استخدم الماسح الضوئي أو أدخل اسم المنتج"
                 style="width:100%; padding:0.75rem; font-size:1rem" />
        </span>
        <div class="mt-2 text-sm text-500">بيع بسعر الـ <b>{{ priceMode }}</b></div>
      </div>

      <!-- Cart summary compact -->
      <div class="bg-white p-4 rounded-lg shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <div class="text-lg font-semibold">السلة</div>
          <div><span class="p-badge" [value]="cart.length"></span></div>
        </div>

        <div *ngIf="cart.length === 0" class="flex flex-col items-center justify-center py-6">
          <i class="pi pi-shopping-cart text-5xl text-500 mb-4"></i>
          <div class="text-center text-gray-600">cart-empty</div>
          <div class="text-center text-sm text-500 mt-2">لم تقم بإضافة أي منتج للسلة بعد، استخدم الماسح الضوئي أو أدخل اسم المنتج لإضافته</div>
        </div>

        <div *ngIf="cart.length > 0">
          <div class="text-sm mb-2">المجموع (غير شامل الضريبة): <b>{{ subtotal | currency:'USD':true:'1.2-2' }}</b></div>
          <div class="text-sm mb-2">مبلغ الخصم: <b>{{ discountAmount | currency:'USD':true:'1.2-2' }}</b></div>
          <div class="text-sm mb-2">عروض ترويجية: <b>{{ promoAmount | currency:'USD':true:'1.2-2' }}</b></div>
          <div class="text-sm mb-2">الضريبة ({{ taxPercent }}%): <b>{{ taxAmount | currency:'USD':true:'1.2-2' }}</b></div>
          <hr class="my-2" />
          <div class="text-lg font-bold">الإجمالي (شامل الضريبة): <b>{{ total | currency:'USD':true:'1.2-2' }}</b></div>

          <div class="mt-4 flex gap-2">
            <button pButton label="إضافة" icon="pi pi-plus" (click)="focusScanner()" class="p-button-success"></button>
            <button pButton label="إنهاء البيع" icon="pi pi-check" (click)="checkout()" class="p-button-primary"></button>
            <button pButton label="تفريغ السلة" icon="pi pi-trash" (click)="clearCart()" class="p-button-danger p-button-outlined"></button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main layout: products table + cart detail -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2 bg-white p-4 rounded-lg shadow-sm">
        <p-table [value]="searchResults" [paginator]="true" [rows]="8" [responsiveLayout]="'scroll'">
          <ng-template pTemplate="header">
            <tr>
              <th>الباركود / كود</th>
              <th>اسم المنتج</th>
              <th>السعر</th>
              <th>المخزون</th>
              <th style="width:150px">إجراءات</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-product>
            <tr>
              <td>{{ product.barcode || product.id }}</td>
              <td>{{ product.name }}</td>
              <td>{{ product.price | currency:'USD' }}</td>
              <td>{{ product.quantity || 0 }}</td>
              <td>
                <button pButton icon="pi pi-shopping-cart" (click)="addToCart(product)" label="أضف" class="p-button-sm"></button>
                <button pButton icon="pi pi-eye" (click)="showProduct(product)" class="p-button-text p-button-sm"></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="5" class="text-center">لا توجد نتائج</td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- Cart detail -->
      <div class="bg-white p-4 rounded-lg shadow-sm">
        <h3 class="text-lg font-semibold mb-3">تفاصيل السلة</h3>
        <table class="w-full border-collapse">
          <thead>
            <tr class="text-sm text-gray-600">
              <th>الصنف</th>
              <th>الكمية</th>
              <th>السعر</th>
              <th>المجموع</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let it of cart; let i = index" class="align-middle">
              <td>{{ it.product.name }}</td>
              <td>
                <p-inputNumber [(ngModel)]="it.qty" (ngModelChange)="recalcLine(it)" [min]="1" [mode]="'decimal'"></p-inputNumber>
              </td>
              <td>{{ it.price | currency:'USD' }}</td>
              <td>{{ it.lineTotal | currency:'USD' }}</td>
              <td>
                <button pButton icon="pi pi-trash" class="p-button-text p-button-sm" (click)="removeFromCart(i)"></button>
              </td>
            </tr>
            <tr *ngIf="cart.length === 0">
              <td colspan="5" class="text-center text-gray-500 py-6">السلة فارغة</td>
            </tr>
          </tbody>
        </table>

        <!-- quick controls -->
        <div class="mt-4">
          <label class="block mb-1">خصم (قيمة ثابتة)</label>
          <input pInputText type="number" [(ngModel)]="discountAmount" (input)="recalcTotals()" />
          <label class="block mt-2 mb-1">عروض ترويجية (قيمة ثابتة)</label>
          <input pInputText type="number" [(ngModel)]="promoAmount" (input)="recalcTotals()" />
          <label class="block mt-2 mb-1">نسبة الضريبة %</label>
          <input pInputText type="number" [(ngModel)]="taxPercent" (input)="recalcTotals()" />
        </div>
      </div>
    </div>

    <!-- product dialog (عرض سريع) -->
    <p-dialog header="عرض المنتج" [(visible)]="productDialogVisible" [modal]="true" [style]="{width: '420px'}">
      <div *ngIf="selectedProduct">
        <h4>{{ selectedProduct.name }}</h4>
        <p>السعر: {{ selectedProduct.price | currency:'USD' }}</p>
        <p>المخزون: {{ selectedProduct.quantity || 0 }}</p>
      </div>
      <ng-template pTemplate="footer">
        <button pButton label="إغلاق" (click)="productDialogVisible = false" class="p-button-text"></button>
        <button pButton label="أضف إلى السلة" (click)="addToCart(selectedProduct); productDialogVisible = false" class="p-button-primary"></button>
      </ng-template>
    </p-dialog>
  </div>
  `,
  styles: [`
    :host { display:block; }
    /* بعض التنسيقات البسيطة */ 
  `],
  providers: [CurrencyPipe]
})
export class PosComponent implements OnInit {
  @ViewChild('scannerInput') scannerInput!: ElementRef<HTMLInputElement>;

  searchText: string = '';
  searchResults: Product[] = [];
  priceMode: string = 'البيع'; // يمكن تغييره (مثال: "جملة")
  cart: CartItem[] = [];

  // إعدادات الحساب
  taxPercent: number = 15;
  discountAmount: number = 0;
  promoAmount: number = 0;

  // totals
  subtotal: number = 0;
  taxAmount: number = 0;
  total: number = 0;

  // dialog
  productDialogVisible: boolean = false;
  selectedProduct: Product | null = null;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    // تحميل منتجات افتراضية للبحث (يمكن استبدالها بخدمة API)
    this.productService.getProductsSmall().then((data) => {
      this.searchResults = data;
    });
    this.recalcTotals();
  }

  focusScanner() {
    setTimeout(() => this.scannerInput?.nativeElement.focus(), 0);
  }

 /**
  * 
  *   async onScanEnter() {
    const text = (this.searchText || '').trim();
    if (!text) return;
    // محاولة البحث بالباركود أولاً ثم بالاسم
    let found: Product | undefined;
    // افتراض وجود دالة getByBarcode في الخدمة — إذا لم تكن موجودة استخدم البحث بالاسم
    if (this.productService.getByBarcode) {
      try {
        found = await this.productService.getByBarcode(text);
      } catch (e) { found = undefined; }
    }
    if (!found) {
      // بحث اسم يحتوي النص
      const all = await this.productService.getProductsSmall();
      found = all.find(p => (p.name || '').toLowerCase().includes(text.toLowerCase()) || (p.id+'') === text);
    }
    if (found) {
      this.addToCart(found);
    } else {
      // لو لم يجد، اعرض نتائج البحث المطابقة
      const all = await this.productService.getProductsSmall();
      this.searchResults = all.filter(p => (p.name || '').toLowerCase().includes(text.toLowerCase()));
    }
    this.searchText = '';
    this.focusScanner();
  }

  */
  addToCart(product: Product | null) {
    if (!product) return;
    const idx = this.cart.findIndex(c => c.product.id === product.id);
    if (idx > -1) {
      this.cart[idx].qty += 1;
      this.recalcLine(this.cart[idx]);
    } else {
      const item: CartItem = {
        product,
        qty: 1,
        price: product.price || 0,
        lineTotal: product.price || 0
      };
      this.cart.unshift(item);
    }
    this.recalcTotals();
  }

  removeFromCart(index: number) {
    this.cart.splice(index, 1);
    this.recalcTotals();
  }

  recalcLine(item: CartItem) {
    item.lineTotal = Number((item.qty * item.price).toFixed(2));
    this.recalcTotals();
  }

  recalcTotals() {
    this.subtotal = this.cart.reduce((s, c) => s + (c.lineTotal || 0), 0);
    // خصم و عروض تُطرح من المجموع قبل الضريبة (سلوك يمكن تغييره)
    const afterDiscount = Math.max(0, this.subtotal - (this.discountAmount || 0) - (this.promoAmount || 0));
    this.taxAmount = Number(((afterDiscount * (this.taxPercent || 0)) / 100).toFixed(2));
    this.total = Number((afterDiscount + this.taxAmount).toFixed(2));
  }

  clearCart() {
    this.cart = [];
    this.recalcTotals();
  }

  checkout() {
    if (this.cart.length === 0) {
      alert('السلة فارغة');
      return;
    }
    // هنا نقوم بعمليات النهاية: حفظ الفاتورة، طباعة الإيصال، فتح نافذة الدفع...
    const payload = {
      items: this.cart.map(c => ({ productId: c.product.id, qty: c.qty, unitPrice: c.price })),
      subtotal: this.subtotal,
      discount: this.discountAmount,
      promo: this.promoAmount,
      taxPercent: this.taxPercent,
      taxAmount: this.taxAmount,
      total: this.total,
      date: new Date()
    };
    console.log('Checkout payload', payload);
    alert(`تم إنشاء الفاتورة (تجريبي). الإجمالي: ${this.total}`);
    // بعد الإتمام نمسح السلة
    this.clearCart();
  }

  showProduct(p: Product) {
    this.selectedProduct = p;
    this.productDialogVisible = true;
  }
}
