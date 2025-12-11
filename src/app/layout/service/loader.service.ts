import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private _loading = new BehaviorSubject<boolean>(false);
  public loading$ = this._loading.asObservable();
  private counter = 0;

  show() {
    this.counter++;
    if (this.counter > 0) this._loading.next(true);
  }

  hide(force = false) {
    if (force) {
      this.counter = 0;
      this._loading.next(false);
      return;
    }
    this.counter = Math.max(0, this.counter - 1);
    if (this.counter === 0) this._loading.next(false);
  }
}
