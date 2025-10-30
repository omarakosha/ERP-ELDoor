import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

interface POS {
  id: number;
  name: string;
  location: string;
  openedAt: string;
  user: string;
  paymentMethods: string;
  status: 'open' | 'closed';
  openOnOtherDevice?: boolean;
    showCloseWarning?: boolean;
}


@Component({
  selector: 'app-pos',
   imports: [CommonModule, FormsModule, DialogModule, ButtonModule, InputTextModule, CardModule,  ToastModule,],
 providers: [MessageService],
  templateUrl: './pos.html',
  styleUrls: ['./pos.scss'],
})

export class PosComponent {
     constructor(private router: Router,private messageService: MessageService) {}
  
  searchQuery: string = '';
  addDialogVisible: boolean = false;

  newPos: Partial<POS> = {
    name: '',
    location: '',
    paymentMethods: 'نقدي',
  };

  posList: POS[] = [
    {
      id: 1,
      name: 'الصندوق الرئيسي',
      location: 'Default',
      openedAt: '11:46 AM - August 14, 2025',
      user: 'Super Admin',
      paymentMethods: 'نقدي و +2 طرق دفع أخرى',
      status: 'open',
       openOnOtherDevice: false,
      showCloseWarning: false
    },
    {
      id: 2,
      name: 'نقطة بيع فرعية',
      location: 'Default',
      openedAt: '10:10 AM - August 13, 2025',
      user: 'أحمد علي',
      paymentMethods: 'بطاقة + نقدي',
      status: 'closed',
       openOnOtherDevice: false,
      showCloseWarning: false
    },
    {
      id: 3,
      name: 'POS فرع المبيعات',
      location: 'Default',
      openedAt: '09:00 AM - August 12, 2025',
      user: 'محمد سالم',
      paymentMethods: 'نقدي',
       status: 'open',
      openOnOtherDevice: true,
      showCloseWarning: false
    },
  ];

  filteredPosList: POS[] = [...this.posList];

  filterPosList() {
    const q = this.searchQuery.trim().toLowerCase();
    this.filteredPosList = this.posList.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
    );
  }

  continueSale(pos: any) {
  this.router.navigate(['/casher'], { queryParams: { posId: pos.id, posName: pos.name } });
}

attemptClosePos(pos: any) {
  if(pos.openOnOtherDevice) {
    // عرض الرسالة فقط عند محاولة الإغلاق
    pos.showCloseWarning = true;
  } else {
    this.closePos(pos);
  }
}

closePos(pos: any) {
  // هنا ضع عملية إغلاق الصندوق الفعلية
  pos.showCloseWarning = false;
  pos.openOnOtherDevice = false; // مثال على التحديث بعد الإغلاق
}


  openAddDialog() {
    this.addDialogVisible = true;
  }

saveNewPos() {
  // تحقق من صحة البيانات
  if (!this.newPos.name || !this.newPos.location) {
    this.messageService.clear();
    this.messageService.add({ 
      severity: 'warn', 
      summary: 'Validation', 
      detail: 'Please check the POS data!' 
    });
    return; // أوقف العملية إذا البيانات غير مكتملة
  }

  // إضافة POS جديد
  this.posList.push({
    id: this.posList.length + 1,
    name: this.newPos.name!,
    location: this.newPos.location!,
    openedAt: new Date().toLocaleString('ar-EG'),
    user: 'Super Admin',
    paymentMethods: this.newPos.paymentMethods || 'نقدي',
    status: 'open',
  });

  // عرض رسالة نجاح
  this.messageService.clear();
  this.messageService.add({ 
    severity: 'success', 
    summary: 'Saved', 
    detail: 'POS added successfully!' 
  });

  // تحديث القائمة وإغلاق الـ dialog
  this.filterPosList();
  this.addDialogVisible = false;
  this.newPos = {};
}



  
}
