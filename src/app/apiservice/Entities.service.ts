import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EntityRecord {
  id: number;
  name: string;
  code?: string; // ← اجعلها optional لتتوافق مع الـ backend
  entityType?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  accountId?: number;
  accountName?: string;
  accountCode?: string;
}


@Injectable({
  providedIn: 'root'
})
export class EntitiesService {

  private api = 'https://localhost:7175/api/entities';

  constructor(private http: HttpClient) {}

  getAll(type?: string): Observable<EntityRecord[]> {
    const url = type ? `${this.api}?type=${type}` : this.api;
    return this.http.get<EntityRecord[]>(url);
  }

  // -------------------- جلب الـ Entities حسب الحساب --------------------
  getByAccount(accountId: number, type?: string): Observable<EntityRecord[]> {
    let url = `${this.api}/byAccount/${accountId}`;
    if (type) url += `?type=${type}`;
    return this.http.get<EntityRecord[]>(url);
  }

  add(model: EntityRecord): Observable<EntityRecord> {
    return this.http.post<EntityRecord>(this.api, model);
  }

  update(model: EntityRecord): Observable<void> {
    return this.http.put<void>(`${this.api}/${model.id}`, model);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  getById(id: number): Observable<EntityRecord> {
  return this.http.get<EntityRecord>(`${this.api}/${id}`);
}

  getEntityTypeAccounts() {
    return this.http.get<any[]>('https://localhost:7175/api/Accounts/entity-type');
  }
}
