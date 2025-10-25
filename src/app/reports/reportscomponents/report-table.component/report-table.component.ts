import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-report-table',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, TagModule, InputTextModule],
  templateUrl: './report-table.component.html',
})
export class ReportTableComponent {
  @Input() title!: string;
  @Input() data!: any[];
  @Input() columns!: any[];
  @Input() rows: number = 10;
  @Input() loading: boolean = false;
  @Input() showActions: boolean = true;

  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() print = new EventEmitter<any>();

  private searchTimeout: any;

  clear(table: any) {
    table.clear();
  }

  onGlobalFilter(table: any, event: Event) {
    const input = event.target as HTMLInputElement;
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      table.filterGlobal(input.value, 'contains');
    }, 300);
  }

  getSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | null {
    switch (status) {
      case 'active':
      case 'paid':
        return 'success';
      case 'pending':
        return 'warn';
      case 'unpaid':
      case 'inactive':
        return 'danger';
      default:
        return null;
    }
  }
}
