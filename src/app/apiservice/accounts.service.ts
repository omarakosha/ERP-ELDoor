import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Account {
  id: number;
  name: string;
  code: string;
  parentId?: number;

  // الحقول الجديدة
  description?: string;
  type?: string;
  balance?: number;

  children?: Account[]; // إذا كنت تدعم شجرة
}

@Injectable({
  providedIn: 'root'
})
export class AccountsService {
  private apiUrl = 'http://localhost:5133/api/Accounts'; // عدّل حسب البورت الفعلي للـ API

  constructor(private http: HttpClient) {}

  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(this.apiUrl);
  }

  createAccount(account: Account): Observable<Account> {
    return this.http.post<Account>(this.apiUrl, account);
  }

  updateAccount(id: number, account: Account): Observable<Account> {
    return this.http.put<Account>(`${this.apiUrl}/${id}`, account);
  }

  deleteAccount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
