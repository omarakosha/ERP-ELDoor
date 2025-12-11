import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoaderService } from '@/apiservice/loading.service'; // عدّل المسار حسب مشروعك

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private loader: LoaderService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // شغّل اللودر عند بدء الطلب
    this.loader.show();

    return next.handle(req).pipe(
      finalize(() => {
        // اخفِ اللودر عند انتهاء الطلب (ناجح/فاشل/إلغاء)
        this.loader.hide();
      })
    );
  }
}
