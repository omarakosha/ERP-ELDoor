import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';


@Component({
  selector: 'app-pos-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TooltipModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './pos-management-component.html',
})
export class PosManagementComponent {
  constructor(private messageService: MessageService, private confirmationService: ConfirmationService) { }
  addDialogVisible = false;
  searchTerm = '';

  boxes = [
    {
      id: 1,
      location: 'default',
      name: 'الصندوق الرئيسي',
      openedBy: 'Super Admin',
      openDate: new Date('2025-08-14'),
      closeDate: null,
      status: 'Open'
    },
    {
      id: 2,
      location: 'default',
      name: 'الصندوق الرئيسي',
      openedBy: 'Super Admin',
      openDate: new Date('2025-08-14'),
      closeDate: new Date('2025-08-14'),
      status: 'Closed'
    }
  ];

  filteredBoxes = [...this.boxes];

  newBox = {
    name: '',
    location: ''
  };

  filterBoxes() {
    const term = this.searchTerm.toLowerCase();
    this.filteredBoxes = this.boxes.filter(
      b =>
        b.name.toLowerCase().includes(term) ||
        b.location.toLowerCase().includes(term)
    );
  }

  openAddDialog() {
    this.newBox = { name: '', location: '' };
    this.addDialogVisible = true;
  }

  saveNewBox() {
    if (!this.newBox.name || !this.newBox.location) {
      this.messageService.clear();
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'يرجى التحقق من بيانات الصندوق'
      });
      return;
    }

    const newEntry = {
      id: this.boxes.length + 1,
      ...this.newBox,
      openedBy: 'Super Admin',
      openDate: new Date(),
      closeDate: null,
      status: 'مفتوح'
    };
    this.boxes.push(newEntry);

    this.filterBoxes();
    this.addDialogVisible = false;

    this.messageService.clear();
    this.messageService.add({
      severity: 'success',
      summary: 'Saved',
      detail: `تم إضافة الصندوق "${this.newBox.name}" بنجاح`
    });

    // إعادة تعيين النموذج بشكل صحيح
    this.newBox = { name: '', location: '' };
  }

  viewBox(box: any) {
    alert(`📦 تفاصيل الصندوق:\nاسم الصندوق: ${box.name}\nالموقع: ${box.location}\nالحالة: ${box.status}`);
  }

  closeBox(box: any) {
    this.confirmationService.confirm({
      message: `هل تريد إغلاق الصندوق "${box.name}"؟`,
      acceptLabel: 'نعم',
      rejectLabel: 'لا',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        box.status = 'متوازن';
        box.closeDate = new Date();

        this.filterBoxes();

        this.messageService.clear();
        this.messageService.add({
          severity: 'success',
          summary: 'Closed',
          detail: `تم إغلاق الصندوق "${box.name}" بتاريخ ${box.closeDate.toLocaleString('ar-EG')}`
        });
      },
      reject: () => {
        // عند الرفض يمكن تركه فارغ أو إضافة رسالة
      }
    });
  }


}
