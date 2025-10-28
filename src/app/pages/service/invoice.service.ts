import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  constructor(private http: HttpClient) {}

  saveInvoice(data: any): Observable<any> {
    return this.http.post('/api/invoices', data); // عدل الرابط حسب باكندك
  }
}
