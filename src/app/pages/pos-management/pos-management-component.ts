import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

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
    TooltipModule
  ],
  templateUrl: './pos-management-component.html',
})
export class PosManagementComponent {
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
      status: 'مفتوح'
    },
    {
      id: 2,
      location: 'default',
      name: 'الصندوق الرئيسي',
      openedBy: 'Super Admin',
      openDate: new Date('2025-08-14'),
      closeDate: new Date('2025-08-14'),
      status: 'متوازن'
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
    if (this.newBox.name && this.newBox.location) {
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
    }
  }

  viewBox(box: any) {
    alert(`📦 تفاصيل الصندوق: ${box.name}`);
  }

  closeBox(box: any) {
    if (confirm(`هل تريد إغلاق الصندوق "${box.name}"؟`)) {
      box.status = 'متوازن';
      box.closeDate = new Date();
      this.filterBoxes();
    }
  }
}
