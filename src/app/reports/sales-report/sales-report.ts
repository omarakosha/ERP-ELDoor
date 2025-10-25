import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportCardComponent } from '../reportscomponents/report-card.component/report-card.component';
import { SalesReportsService } from '@/pages/service/sales.reports.service';
import { ReportTableComponent } from '../reportscomponents/report-table.component/report-table.component';

interface Report {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  lastUpdate: string;
}

@Component({
  selector: 'app-sales-report',
  standalone: true,
  imports: [CommonModule, ReportCardComponent, ReportTableComponent

  ],
  templateUrl: './sales-report.html',
})
export class SalesReportComponent {
  @Input() favoriteReports: string[] = [];
  @Output() favoriteChanged = new EventEmitter<string>();
  @ViewChild('statusFilter') statusFilter!: TemplateRef<any>;
  @ViewChild('representativeFilter') representativeFilter!: TemplateRef<any>;
  @ViewChild('activityFilter') activityFilter!: TemplateRef<any>;
  @ViewChild('statusTemplate') statusTemplate!: TemplateRef<any>;
  @ViewChild('activityTemplate') activityTemplate!: TemplateRef<any>;


  taxColumns: any[] = [];
  selectedReportId: string | null = null;


  taxData: any[] = [
    { invoiceNo: 'INV001', supplier: 'ABC', amount: 1500, date: '2025-10-05', status: 'paid', activity: 70 },
    { invoiceNo: 'INV002', supplier: 'XYZ', amount: 2400, date: '2025-10-06', status: 'pending', activity: 50 },
  ];


  reports: Report[] = [];


  constructor(private salesReportsService: SalesReportsService) { }
  ngOnInit() {
    // ✅ جلب البيانات من الخدمة
    this.reports = this.salesReportsService.getData();
  }
  toggleFavorite(reportId: string) {
    this.favoriteChanged.emit(reportId);
  }

  isFavorite(reportId: string): boolean {
    return this.favoriteReports.includes(reportId);
  }

  onEdit(row: any) { console.log('Edit', row); }
  onDelete(row: any) { console.log('Delete', row); }
  onPrint(row: any) { console.log('Print', row); }

  onReportSelected(reportId: string) {
    this.selectedReportId = reportId;
    this.loadReportData(reportId);
  }

  getReportTitle(reportId: string): string {
    const report = this.reports.find(r => r.id === reportId);
    return report ? report.title : '';
  }


  ngAfterViewInit() {
    this.taxColumns = [
      { field: 'invoiceNo', header: 'رقم الفاتورة' },
      { field: 'vatNo', header: 'الرقم الضريبي للعميل' },
      { field: 'supplier', header: ' اسم العميل' },
      { field: 'amount', header: 'المبيعات (شاملة الضريبة)' },
      { field: 'date', header: 'المبلغ المدفوع' },
      { field: 'status', header: 'المبلغ المستحق', filter: this.statusFilter, template: this.statusTemplate },
      { field: 'representative.name', header: 'المندوب', filter: this.representativeFilter },
      { field: 'activity', header: 'النشاط', filter: this.activityFilter, template: this.activityTemplate },
      { field: 'location', header: ' الموقع' },
      { field: 'selas', header: '  المبيعات' },
      { field: 'reph', header: '  قيمة الربح' },
      { field: 'cost', header: '   تكلفة البضاعة المباعة' },
      { field: 'vatselas', header: ' ضريبة المبيعات' },

      { field: 'prodecttype', header: ' فئة المنتج' },
      { field: 'qsalas', header: '  الكمية المباعة' },
      { field: 'qretern', header: ' الكمية المرتجعة' },
      { field: 'vat', header: '  الضريبة %15' },
      { field: 'users', header: ' المستخدم / الوظيفة' },
      { field: 'paystatus', header: '  حالة الدفع' },
    ];
  }


  loadReportData(reportId: string) {
    if (reportId === 'customer-payments') {
      // البيانات الخاصة بتقرير المدفوعات
      this.taxData = [
        { supplier: 'مؤسسة النور', vatcstm: '100252525458200125', vatamount: 5000, mountpay: 52220, mountdsc: 20000 },
        { supplier: 'شركة السريع', vatcstm: '100252525458212224', vatamount: 3200, mountpay: 522222, mountdsc: 2555555 },
      ];

      // الأعمدة التي تظهر لهذا التقرير فقط
      this.taxColumns = [

        { field: 'supplier', header: 'اسم العميل' },
        { field: 'vatcstm', header: 'الرقم الضريبي للعميل' },
        { field: 'vatamount', header: 'المبيعات (شاملة الضريبة)' },
        { field: 'mountpay', header: 'المبلغ المدفوع' },
        { field: 'mountdsc', header: 'المبلغ المستحق' },

      ];

    }

    else if (reportId === 'sales-per-location') {

      // البيانات الخاصة بتقرير المبيعات حسب الموقع
      this.taxData = [
        { invoiceNo: 'INV-2001', supplier: 'شركة ABC', amount: 1200, date: '2025-10-01', status: 'paid', activity: 60, location: 'الرياض' },
        { invoiceNo: 'INV-2002', supplier: 'شركة XYZ', amount: 980, date: '2025-10-03', status: 'unpaid', activity: 30, location: 'جدة' },
      ];


      // الأعمدة الخاصة بتقرير المبيعات حسب الموقع
      this.taxColumns = [
        { field: 'invoiceNo', header: 'الرقم الضريبي للعميل' },
        { field: 'supplier', header: 'اسم العميل' },
        { field: 'amount', header: 'المبيعات (شاملة الضريبة)' },
        { field: 'location', header: 'الموقع' },
        { field: 'activity', header: 'النشاط' },
      ];



    }



    else if (reportId === 'sales-by-category') {

      // البيانات الخاصة بتقرير المبيعات حسب الموقع
      this.taxData = [
        { invoiceNo: 'INV-2001', supplier: 'شركة ABC', amount: 1200, date: '2025-10-01', status: 'paid', activity: 60, location: 'الرياض' },
        { invoiceNo: 'INV-2002', supplier: 'شركة XYZ', amount: 980, date: '2025-10-03', status: 'unpaid', activity: 30, location: 'جدة' },
      ];


      // الأعمدة الخاصة بتقرير المبيعات حسب الموقع
      this.taxColumns = [
        { field: 'invoiceNo', header: 'الرقم الضريبي للعميل' },
        { field: 'supplier', header: 'اسم العميل' },
        { field: 'amount', header: 'المبيعات (شاملة الضريبة)' },
        { field: 'location', header: 'الموقع' },
        { field: 'activity', header: 'النشاط' },
      ];



    }


    else if (reportId === 'sales-per-invoice') {

      // البيانات الخاصة بتقرير المبيعات حسب الموقع
      this.taxData = [
        { invoiceNo: 'INV-2001', supplier: 'شركة ABC', amount: 1200, date: '2025-10-01', status: 'paid', activity: 60, location: 'الرياض' },
        { invoiceNo: 'INV-2002', supplier: 'شركة XYZ', amount: 980, date: '2025-10-03', status: 'unpaid', activity: 30, location: 'جدة' },
      ];


      // الأعمدة الخاصة بتقرير المبيعات حسب الموقع
      this.taxColumns = [
        { field: 'invoiceNo', header: 'الرقم الضريبي للعميل' },
        { field: 'supplier', header: 'اسم العميل' },
        { field: 'amount', header: 'المبيعات (شاملة الضريبة)' },
        { field: 'location', header: 'الموقع' },
        { field: 'activity', header: 'النشاط' },
      ];



    }


    else if (reportId === 'sales-per-employee') {

      // البيانات الخاصة بتقرير المبيعات حسب الموقع
      this.taxData = [
        { invoiceNo: 'INV-2001', supplier: 'شركة ABC', amount: 1200, date: '2025-10-01', status: 'paid', activity: 60, location: 'الرياض' },
        { invoiceNo: 'INV-2002', supplier: 'شركة XYZ', amount: 980, date: '2025-10-03', status: 'unpaid', activity: 30, location: 'جدة' },
      ];


      // الأعمدة الخاصة بتقرير المبيعات حسب الموقع
      this.taxColumns = [
        { field: 'invoiceNo', header: 'الرقم الضريبي للعميل' },
        { field: 'supplier', header: 'اسم العميل' },
        { field: 'amount', header: 'المبيعات (شاملة الضريبة)' },
        { field: 'location', header: 'الموقع' },
        { field: 'activity', header: 'النشاط' },
      ];



    }



    else if (reportId === 'sales-by-payment-status') {

      // البيانات الخاصة بتقرير المبيعات حسب الموقع
      this.taxData = [
        {
          paystatus: 'paid', location: 'الرياض', selas: 1200, cost: '2000',
          reph: 2000, vatselas: 60, amount: 60, qsalas: 60, qretern: 60,
        },

        {
          paystatus: 'unpaid', location: 'جدة', selas: 980, cost: '2021',
          reph: 1000, vatselas: 30, amount: 60, qsalas: 60, qretern: 60,
        },

           {
          paystatus: 'paid', location: 'الرياض', selas: 1200, cost: '2000',
          reph: 2000, vatselas: 60, amount: 60, qsalas: 60, qretern: 60,
        },

        {
          paystatus: 'unpaid', location: 'جدة', selas: 980, cost: '2021',
          reph: 1000, vatselas: 30, amount: 60, qsalas: 60, qretern: 60,
        },
           {
          paystatus: 'paid', location: 'الرياض', selas: 1200, cost: '2000',
          reph: 2000, vatselas: 60, amount: 60, qsalas: 60, qretern: 60,
        },

        {
          paystatus: 'unpaid', location: 'جدة', selas: 980, cost: '2021',
          reph: 1000, vatselas: 30, amount: 60, qsalas: 60, qretern: 60,
        },
          {
          paystatus: 'paid', location: 'الرياض', selas: 1200, cost: '2000',
          reph: 2000, vatselas: 60, amount: 60, qsalas: 60, qretern: 60,
        },

        {
          paystatus: 'unpaid', location: 'جدة', selas: 980, cost: '2021',
          reph: 1000, vatselas: 30, amount: 60, qsalas: 60, qretern: 60,
        },
          {
          paystatus: 'paid', location: 'الرياض', selas: 1200, cost: '2000',
          reph: 2000, vatselas: 60, amount: 60, qsalas: 60, qretern: 60,
        },

        {
          paystatus: 'unpaid', location: 'جدة', selas: 980, cost: '2021',
          reph: 1000, vatselas: 30, amount: 60, qsalas: 60, qretern: 60,
        },
          {
          paystatus: 'paid', location: 'الرياض', selas: 1200, cost: '2000',
          reph: 2000, vatselas: 60, amount: 60, qsalas: 60, qretern: 60,
        },

        {
          paystatus: 'unpaid', location: 'جدة', selas: 980, cost: '2021',
          reph: 1000, vatselas: 30, amount: 60, qsalas: 60, qretern: 60,
        },
          {
          paystatus: 'paid', location: 'الرياض', selas: 1200, cost: '2000',
          reph: 2000, vatselas: 60, amount: 60, qsalas: 60, qretern: 60,
        },

        {
          paystatus: 'unpaid', location: 'جدة', selas: 980, cost: '2021',
          reph: 1000, vatselas: 30, amount: 60, qsalas: 60, qretern: 60,
        },
          {
          paystatus: 'paid', location: 'الرياض', selas: 1200, cost: '2000',
          reph: 2000, vatselas: 60, amount: 60, qsalas: 60, qretern: 60,
        },

        {
          paystatus: 'unpaid', location: 'جدة', selas: 980, cost: '2021',
          reph: 1000, vatselas: 30, amount: 60, qsalas: 60, qretern: 60,
        },
          {
          paystatus: 'paid', location: 'الرياض', selas: 1200, cost: '2000',
          reph: 2000, vatselas: 60, amount: 60, qsalas: 60, qretern: 60,
        },

        {
          paystatus: 'unpaid', location: 'جدة', selas: 980, cost: '2021',
          reph: 1000, vatselas: 30, amount: 60, qsalas: 60, qretern: 60,
        },
          {
          paystatus: 'paid', location: 'الرياض', selas: 1200, cost: '2000',
          reph: 2000, vatselas: 60, amount: 60, qsalas: 60, qretern: 60,
        },

        {
          paystatus: 'unpaid', location: 'جدة', selas: 980, cost: '2021',
          reph: 1000, vatselas: 30, amount: 60, qsalas: 60, qretern: 60,
        },
          {
          paystatus: 'paid', location: 'الرياض', selas: 1200, cost: '2000',
          reph: 2000, vatselas: 60, amount: 60, qsalas: 60, qretern: 60,
        },

        {
          paystatus: 'unpaid', location: 'جدة', selas: 980, cost: '2021',
          reph: 1000, vatselas: 30, amount: 60, qsalas: 60, qretern: 60,
        },
          {
          paystatus: 'paid', location: 'الرياض', selas: 1200, cost: '2000',
          reph: 2000, vatselas: 60, amount: 60, qsalas: 60, qretern: 60,
        },

        {
          paystatus: 'unpaid', location: 'جدة', selas: 980, cost: '2021',
          reph: 1000, vatselas: 30, amount: 60, qsalas: 60, qretern: 60,
        },

      ];


      // الأعمدة الخاصة بتقرير المبيعات حسب الموقع
      this.taxColumns = [
        { field: 'paystatus', header: '  حالة الدفع' },
        { field: 'location', header: ' الموقع' },
        { field: 'selas', header: '  المبيعات' },
        { field: 'reph', header: '  قيمة الربح' },
        { field: 'cost', header: '   تكلفة البضاعة المباعة' },
        { field: 'vatselas', header: ' ضريبة المبيعات' },
        { field: 'amount', header: 'المبيعات (شاملة الضريبة)' },
        { field: 'qsalas', header: '  الكمية المباعة' },
        { field: 'qretern', header: ' الكمية المرتجعة' },
      ];





    }




    else if (reportId === 'sales-per-customer') {

      // البيانات الخاصة بتقرير المبيعات حسب الموقع
      this.taxData = [
        { invoiceNo: 'INV-2001', supplier: 'شركة ABC', amount: 1200, date: '2025-10-01', status: 'paid', activity: 60, location: 'الرياض' },
        { invoiceNo: 'INV-2002', supplier: 'شركة XYZ', amount: 980, date: '2025-10-03', status: 'unpaid', activity: 30, location: 'جدة' },
      ];


      // الأعمدة الخاصة بتقرير المبيعات حسب الموقع
      this.taxColumns = [
        { field: 'invoiceNo', header: 'الرقم الضريبي للعميل' },
        { field: 'supplier', header: 'اسم العميل' },
        { field: 'amount', header: 'المبيعات (شاملة الضريبة)' },
        { field: 'location', header: 'الموقع' },
        { field: 'activity', header: 'النشاط' },
      ];



    }




    else if (reportId === 'sales-per-channel') {

      // البيانات الخاصة بتقرير المبيعات حسب الموقع
      this.taxData = [
        { invoiceNo: 'INV-2001', supplier: 'شركة ABC', amount: 1200, date: '2025-10-01', status: 'paid', activity: 60, location: 'الرياض' },
        { invoiceNo: 'INV-2002', supplier: 'شركة XYZ', amount: 980, date: '2025-10-03', status: 'unpaid', activity: 30, location: 'جدة' },
      ];


      // الأعمدة الخاصة بتقرير المبيعات حسب الموقع
      this.taxColumns = [
        { field: 'invoiceNo', header: 'الرقم الضريبي للعميل' },
        { field: 'supplier', header: 'اسم العميل' },
        { field: 'amount', header: 'المبيعات (شاملة الضريبة)' },
        { field: 'location', header: 'الموقع' },
        { field: 'activity', header: 'النشاط' },
      ];



    }



    else if (reportId === 'customer-transactions') {

      // البيانات الخاصة بتقرير المبيعات حسب الموقع
      this.taxData = [
        { invoiceNo: 'INV-2001', supplier: 'شركة ABC', amount: 1200, date: '2025-10-01', status: 'paid', activity: 60, location: 'الرياض' },
        { invoiceNo: 'INV-2002', supplier: 'شركة XYZ', amount: 980, date: '2025-10-03', status: 'unpaid', activity: 30, location: 'جدة' },
      ];


      // الأعمدة الخاصة بتقرير المبيعات حسب الموقع
      this.taxColumns = [
        { field: 'invoiceNo', header: 'الرقم الضريبي للعميل' },
        { field: 'supplier', header: 'اسم العميل' },
        { field: 'amount', header: 'المبيعات (شاملة الضريبة)' },
        { field: 'location', header: 'الموقع' },
        { field: 'activity', header: 'النشاط' },
      ];



    }



    else if (reportId === 'transactions-per-location') {

      // البيانات الخاصة بتقرير المبيعات حسب الموقع
      this.taxData = [
        { invoiceNo: 'INV-2001', supplier: 'شركة ABC', amount: 1200, date: '2025-10-01', status: 'paid', activity: 60, location: 'الرياض' },
        { invoiceNo: 'INV-2002', supplier: 'شركة XYZ', amount: 980, date: '2025-10-03', status: 'unpaid', activity: 30, location: 'جدة' },
      ];


      // الأعمدة الخاصة بتقرير المبيعات حسب الموقع
      this.taxColumns = [
        { field: 'invoiceNo', header: 'الرقم الضريبي للعميل' },
        { field: 'supplier', header: 'اسم العميل' },
        { field: 'amount', header: 'المبيعات (شاملة الضريبة)' },
        { field: 'location', header: 'الموقع' },
        { field: 'activity', header: 'النشاط' },
      ];



    }



    else if (reportId === 'products-sold-per-customer') {

      // البيانات الخاصة بتقرير المبيعات حسب الموقع
      this.taxData = [
        { invoiceNo: 'INV-2001', supplier: 'شركة ABC', amount: 1200, date: '2025-10-01', status: 'paid', activity: 60, location: 'الرياض' },
        { invoiceNo: 'INV-2002', supplier: 'شركة XYZ', amount: 980, date: '2025-10-03', status: 'unpaid', activity: 30, location: 'جدة' },
      ];


      // الأعمدة الخاصة بتقرير المبيعات حسب الموقع
      this.taxColumns = [
        { field: 'invoiceNo', header: 'الرقم الضريبي للعميل' },
        { field: 'supplier', header: 'اسم العميل' },
        { field: 'amount', header: 'المبيعات (شاملة الضريبة)' },
        { field: 'location', header: 'الموقع' },
        { field: 'activity', header: 'النشاط' },
      ];



    }



    else if (reportId === 'sales-by-period') {

      // البيانات الخاصة بتقرير المبيعات حسب الموقع
      this.taxData = [
        { invoiceNo: 'INV-2001', supplier: 'شركة ABC', amount: 1200, date: '2025-10-01', status: 'paid', activity: 60, location: 'الرياض' },
        { invoiceNo: 'INV-2002', supplier: 'شركة XYZ', amount: 980, date: '2025-10-03', status: 'unpaid', activity: 30, location: 'جدة' },
      ];


      // الأعمدة الخاصة بتقرير المبيعات حسب الموقع
      this.taxColumns = [
        { field: 'invoiceNo', header: 'الرقم الضريبي للعميل' },
        { field: 'supplier', header: 'اسم العميل' },
        { field: 'amount', header: 'المبيعات (شاملة الضريبة)' },
        { field: 'location', header: 'الموقع' },
        { field: 'activity', header: 'النشاط' },
      ];



    }



    else if (reportId === 'sales-by-payment-method') {

      // البيانات الخاصة بتقرير المبيعات حسب الموقع
      this.taxData = [
        { invoiceNo: 'INV-2001', supplier: 'شركة ABC', amount: 1200, date: '2025-10-01', status: 'paid', activity: 60, location: 'الرياض' },
        { invoiceNo: 'INV-2002', supplier: 'شركة XYZ', amount: 980, date: '2025-10-03', status: 'unpaid', activity: 30, location: 'جدة' },
      ];


      // الأعمدة الخاصة بتقرير المبيعات حسب الموقع
      this.taxColumns = [
        { field: 'invoiceNo', header: 'الرقم الضريبي للعميل' },
        { field: 'supplier', header: 'اسم العميل' },
        { field: 'amount', header: 'المبيعات (شاملة الضريبة)' },
        { field: 'location', header: 'الموقع' },
        { field: 'activity', header: 'النشاط' },
      ];



    }




    else {
      // في حال لم يتم اختيار تقرير
      this.taxData = [];
      this.taxColumns = [];
    }
  }


}
