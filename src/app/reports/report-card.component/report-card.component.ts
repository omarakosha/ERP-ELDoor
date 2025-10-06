import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-report-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-card.component.html',
})
export class ReportCardComponent {
  @Input() report: any;
  @Input() isFavorite: boolean = false;
  @Output() favoriteChanged = new EventEmitter<string>();

  toggleFavorite(event: Event) {
    event.stopPropagation();
    this.favoriteChanged.emit(this.report.id);
  }
}
