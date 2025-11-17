import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Account {
  id: number;
  code: string;
  name: string;
  type?: string; // Revenue, Expense, Asset, Liability, Equity,Cost Centers
  currency?: string;
  description?: string;
  active: boolean;
  autoRollover: boolean;
  allowTransactions: boolean;
  parentId?: number;
  level: number;
  defaultTaxId?: number;
  balanceType?: string;
  children?: Account[];
  entityType?: string; // الموردين و المقاولين و 
  
}


export interface MyTreeNode {
  key: string;
  label: string;
  data: Account;
  children: MyTreeNode[];
  level?: number;
  expanded?: boolean;
}


@Injectable({ providedIn: 'root' })

export class AccountsService {
  private apiUrl = 'https://localhost:7175/api/Accounts';

  constructor(private http: HttpClient) { }

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
  getAccountByCode(code: string): Observable<Account | null> {
  return this.http.get<Account | null>(`${this.apiUrl}/${code}`);
}

getChildAccounts(parentCode: string): Observable<Account[]> {
  return this.http.get<Account[]>(`${this.apiUrl}/${parentCode}/children`);
}
// تحميل الحسابات الفرعية لمراكز التكلفة فقط
// تحميل كل مراكز التكلفة
getAllCostCenters(): Observable<Account[]> {
  const url = `${this.apiUrl}/type/Cost_Centers`;
  return this.http.get<Account[]>(url);
}

getEntityTypeAccounts() {
  return this.http.get<any[]>('https://localhost:7175/api/Accounts/entity-type');
}


}

