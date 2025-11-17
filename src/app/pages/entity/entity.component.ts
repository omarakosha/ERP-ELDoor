import { Component, OnInit } from '@angular/core';
import { AccountsService } from '@/apiservice/accounts.service';
import { EntitiesService ,EntityRecord} from '@/apiservice/Entities.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';



@Component({
  selector: 'app-entity',
  templateUrl: './entity.component.html',
  styleUrls: ['./entity.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    Select
  ],
})
export class EntityComponent implements OnInit {

  list: EntityRecord[] = [];
  loading = false;

  displayDialog = false;

  isTypeChangedManually = false;


  model: EntityRecord = {
    id: 0,
    name: '',
    code: '',
    entityType: undefined,
    phone: '',
    email: '',
    address: '',
    taxNumber: '',
    accountId: undefined
  };

  types: { label: string, value: string }[] = [];
  selectedType: string | null = null;

  accounts: any[] = [];
  filteredAccounts: any[] = [];

  // compare function لـ p-select
  compareFn = (o1: any, o2: any) => o1 === o2;

  constructor(
    private service: EntitiesService,
    private accountsService: AccountsService
  ) { }

  ngOnInit() {
    this.loadAccounts();
    this.loadEntities();
  }

  loadEntities() {
    this.loading = true;
    this.service.getAll().subscribe(res => {
      this.list = res;
      this.loading = false;
    });
  }

  loadAccounts() {
    this.accountsService.getEntityTypeAccounts().subscribe(res => {
      this.accounts = res.map(a => ({
        ...a,
        fullName: `${a.code} - ${a.name}`
      }));

      // استخراج الأنواع الفريدة
      const typesSet = new Set<string>();
      this.accounts.forEach(a => {
        if (a.entityType?.trim()) typesSet.add(a.entityType.trim());
      });

      this.types = [{ label: 'جميع الأنواع', value: '' }];
      typesSet.forEach(t => this.types.push({ label: t, value: t }));

      this.filteredAccounts = [...this.accounts];
    });
  }

new() {
  this.model = { id: 0, name: '', code: '', entityType: '', phone: '', email: '', address: '', taxNumber: '', accountId: undefined };
  this.filteredAccounts = [...this.accounts];
   this.isTypeChangedManually = true; // يسمح بالتفريغ والتوليد
  this.displayDialog = true;
}

  compareTypes(t1: string, t2: string) {
  return t1 === t2;
}

edit(item: any) {
  this.model = { ...item };
  this.filteredAccounts = [...this.accounts];
  this.isTypeChangedManually = false; 
  this.onTypeChange(); // << هنا onTypeChange يتم استدعاؤها بدون تغيير يدوي
  this.displayDialog = true;
}


compareType(t1: string, t2: string) {
  return t1 === t2;
}

compareAccount(a1: number, a2: number) {
  return a1 === a2;
}


  remove(id: number) {
    if (!confirm('هل تريد حذف السجل؟')) return;
    this.service.delete(id).subscribe(() => this.loadEntities());
  }

  save() {
    if (this.model.id === 0) {
      this.service.add(this.model).subscribe(() => {
        this.displayDialog = false;
        this.loadEntities();
      });
    } else {
      this.service.update(this.model).subscribe(() => {
        this.displayDialog = false;
        this.loadEntities();
      });
    }
  }


onTypeManualChange() {
  this.isTypeChangedManually = true;
  this.onTypeChange();
}


onTypeChange() {
  const type = this.model.entityType;

  if (type && type.trim() !== '') {

    this.filteredAccounts = this.accounts.filter(a =>
      a.entityType && a.entityType.toLowerCase() === type.toLowerCase()
    );

    // تفريغ الحساب فقط إذا المستخدم غيّر النوع فعلياً
    if (this.model.accountId && this.isTypeChangedManually) {
      const exists = this.filteredAccounts.some(a => a.id === this.model.accountId);
      if (!exists) this.model.accountId = undefined;
    }

    // توليد الكود فقط إذا السجل جديد + النوع تغيّر يدويًا
    if (this.model.id === 0 && this.isTypeChangedManually) {
      this.generateCode();
    }
  } 
  else {
    this.filteredAccounts = [...this.accounts];
  }
}


generateCode() {
  const type = this.model.entityType;
  if (!type) return;

  // توليد فقط للسجلات الجديدة (أو غيّر الشرط لو تريد توليد عند كل مرة)
  if (this.model.id && this.model.id !== 0) return;

  // احتاطي: تأكد من أن this.list جاهزة (loadEntities نفذت)
  const count = (this.list?.filter(e => (e.entityType ?? '').toLowerCase() === type.toLowerCase()).length ?? 0) + 1;
  const prefix = type.charAt(0).toUpperCase();
  this.model.code = `${prefix}${count.toString().padStart(4, '0')}`;
}

onAccountChange() {
  const acc = this.filteredAccounts.find(a => a.id === this.model.accountId);

  if (acc) {
    this.model.accountName = acc.name;
    this.model.accountCode = acc.code;
  }
}

}
