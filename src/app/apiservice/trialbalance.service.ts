import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// حساب ميزان المراجعة
export interface TrialBalanceEntry {
  accountId: number;
  account: string;
  entries: {
    date: string;
    description: string;
    debit: number;
    credit: number;
    costCenter: string;
  }[];
  totalDebit: number;
  totalCredit: number;
}

// حسابات الأرباح والخسائر
export interface ProfitLossEntry {
  accountId: number;
  account: string;
  type: 'Revenue' | 'Expense';
  entries: {
    date: string;
    description: string;
    debit: number;
    credit: number;
    costCenter: string | null;
  }[];
  totalDebit: number;
  totalCredit: number;
}

export interface ProfitLossResponse {
  accounts: ProfitLossEntry[];
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
}

// ==================== Balance Sheet Models =====================
export interface BalanceSheetEntry {
  accountId: number;
  account: string;
  type: 'Asset' | 'Liability' | 'Equity';
  debit: number;
  credit: number;
  balance: number;
}

export interface BalanceSheetResponse {
  accounts: BalanceSheetEntry[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  check: number; // يجب أن يكون صفر
}


@Injectable({
  providedIn: 'root'
})
export class TrialBalanceService {
  private apiUrl = 'https://localhost:7175/api/TrialBalance';

  constructor(private http: HttpClient) {}

  getTrialBalance(): Observable<TrialBalanceEntry[]> {
    return this.http.get<TrialBalanceEntry[]>(this.apiUrl);
  }

  getFiltered(accountIds: number[], costCenterIds: number[]): Observable<TrialBalanceEntry[]> {
    const params: any = {};
    if (accountIds?.length) params.accountIds = accountIds.join(',');
    if (costCenterIds?.length) params.costCenterIds = costCenterIds.join(',');
    return this.http.get<TrialBalanceEntry[]>(`${this.apiUrl}/filter`, { params });
  }

  // جلب بيانات الأرباح والخسائر
  getProfitLoss(): Observable<ProfitLossResponse> {
    return this.http.get<ProfitLossResponse>(`${this.apiUrl}/ProfitLoss`);
  }

  
// ==================== Service Method ======================
getBalanceSheet(): Observable<BalanceSheetResponse> {
  return this.http.get<BalanceSheetResponse>(`${this.apiUrl}/BalanceSheet`);
}
}
