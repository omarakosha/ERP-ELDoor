import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoaderService {

  private _loading$ = new BehaviorSubject<boolean>(false);
  loading$ = this._loading$.asObservable();

  private counter = 0;

  private showTimer: any = null;
  private hideTimer: any = null;

  private shownAt = 0;

  private readonly SHOW_DELAY = 300;     // ⏳ لا تُظهر اللودر إلا بعد 300ms
  private readonly MIN_SHOW_TIME = 500;  // 👁️ أقل وقت للعرض بعد الظهور

  show() {
    this.counter++;

    // إذا كان ظاهرًا بالفعل لا تفعل شيء
    if (this._loading$.value) return;

    // انتظر قليلًا قبل الإظهار (لتجاهل الطلبات السريعة)
    if (!this.showTimer) {
      this.showTimer = setTimeout(() => {
        if (this.counter > 0) {
          this._loading$.next(true);
          this.shownAt = Date.now();
        }
        this.showTimer = null;
      }, this.SHOW_DELAY);
    }
  }

  hide() {
    if (this.counter > 0) this.counter--;

    if (this.counter === 0) {

      // إذا لم يظهر بعد → ألغِ التايمر
      if (this.showTimer) {
        clearTimeout(this.showTimer);
        this.showTimer = null;
        return;
      }

      const elapsed = Date.now() - this.shownAt;
      const remaining = this.MIN_SHOW_TIME - elapsed;

      // ضمان أقل وقت عرض
      if (remaining > 0) {
        this.hideTimer = setTimeout(() => {
          this._loading$.next(false);
        }, remaining);
      } else {
        this._loading$.next(false);
      }
    }
  }

  reset() {
    this.counter = 0;
    clearTimeout(this.showTimer);
    clearTimeout(this.hideTimer);
    this._loading$.next(false);
  }
}
