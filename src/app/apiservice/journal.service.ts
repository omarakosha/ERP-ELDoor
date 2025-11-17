import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface JournalEntryDto {
  AccountCode: string;
  AccountName: string;
  Debit: number;
  Credit: number;
  EntityId?:number;
   EntityType?: string;
  Description?: string;
  CostCenterId?: number;
  CostCenterName?: string;
  JournalId?: number;
}

export interface JournalDto {
  id: number;
  journalNumber?: string;
  date: Date;
  description?: string;
  totalDebit: number;
  totalCredit: number;
  status?: string;
  createdBy?: string;
  entries: JournalEntryDto[];
}



@Injectable({
  providedIn: 'root'
})
export class JournalService {
  private apiUrl = 'https://localhost:7175/api/JournalEntries';

  constructor(private http: HttpClient) {}

  // إنشاء القيد مع كل الخطوط دفعة واحدة
// في JournalService
createJournal(journal: JournalDto): Observable<any> {
  // لاحظ إضافة "/dto" هنا
  return this.http.post(`${this.apiUrl}/dto`, journal);
}


  // تعديل القيد مع الخطوط

  // جلب كل القيود
getJournals(): Observable<JournalDto[]> {
  return this.http.get<JournalDto[]>(`${this.apiUrl}`);
}

  // جلب قيد معين
  getJournalById(id: number): Observable<JournalDto> {
    return this.http.get<JournalDto>(`${this.apiUrl}/${id}`);
  }

  // حذف قيد
  deleteJournal(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  updateJournal(id: number, journal: JournalDto): Observable<JournalDto> {
  return this.http.put<JournalDto>(`${this.apiUrl}/dto/${id}`, journal);
}
}
