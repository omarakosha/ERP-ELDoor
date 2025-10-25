import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Report {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  lastUpdate: string;
}

@Component({
  selector: 'app-report-card',
   standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './report-card.component.html',
})
export class ReportCardComponent {
  @Input() report!: Report;
  @Input() isFavorite = false;

  @Output() favoriteChanged = new EventEmitter<string>();
  @Output() reportSelected = new EventEmitter<string>();

  toggleFavorite(event: Event) {
    event.stopPropagation();
    this.favoriteChanged.emit(this.report.id);
  }
  // عند الضغط على البطاقة
  selectReport() {
    this.reportSelected.emit(this.report.id);
  }
}
