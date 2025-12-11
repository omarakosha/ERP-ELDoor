import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private _loading$ = new BehaviorSubject<boolean>(false);
  loading$ = this._loading$.asObservable();

  private counter = 0;
  private showTimer: any = null;
  private readonly MIN_SHOW_TIME = 500; // ms: أقل وقت للعرض لضمان رؤية اللودر

  private shownAt: number = 0; // وقت بدء العرض

  show() {
    this.counter++;
    if (this._loading$.value) return; // إذا ظاهر بالفعل

    // عرض فوري مع تسجيل الوقت
    this._loading$.next(true);
    this.shownAt = Date.now();
  }

  hide() {
    if (this.counter > 0) this.counter--;
    if (this.counter === 0) {
      const elapsed = Date.now() - this.shownAt;
      const remaining = this.MIN_SHOW_TIME - elapsed;

      if (remaining > 0) {
        // إذا لم يمضِ وقت العرض الأدنى، انتظر قبل الإخفاء
        setTimeout(() => this._loading$.next(false), remaining);
      } else {
        this._loading$.next(false);
      }
    }
  }

  reset() {
    this.counter = 0;
    this._loading$.next(false);
    this.shownAt = 0;
    if (this.showTimer) { clearTimeout(this.showTimer); this.showTimer = null; }
  }
}

