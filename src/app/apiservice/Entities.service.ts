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

export interface JournalEntryDto {
  journalId: number;      // رقم القيد
  description: string;    // وصف القيد
  date: string;           // تاريخ القيد
  debit: number;          // مدين
  credit: number;         // دائن
  balanceAfter: number; 
  costCenterId:number;  // الرصيد بعد القيد
  entityId: number;       // معرف المقاول أو الجهة
  entityType: string;     // نوع الكيان (مورد، عميل، إلخ)
  entityName: string;  
  accountId:number   // الاسم الكامل للكيان
}

@Injectable({
  providedIn: 'root'
})
export class EntitiesService {

  private api = 'https://localhost:7175/api/entities';

  constructor(private http: HttpClient) {}

  getAllEntities(): Observable<EntityRecord[]> {
    return this.http.get<EntityRecord[]>(`${this.api}/all`);
  }

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

getLedgerByEntity(entityId: number) {
  return this.http.get<JournalEntryDto[]>(`https://localhost:7175/api/GenericEntities/entity/${entityId}`);
}

  // دالة جلب الحركات لمركز التكلفة
  getCostCenterMovements(centerId: number) {
    return this.http.get<JournalEntryDto[]>(`https://localhost:7175/api/GenericEntities/costcenter/${centerId}`);
  }
  
}
