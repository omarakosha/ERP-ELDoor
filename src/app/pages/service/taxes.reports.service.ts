import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'  // هذا يجعل Angular يوفر الخدمة تلقائيًا
})

export class TaxesReportsService {
    getData() {
        return [
 {
      id: 'tax-declaration',
      title: 'الإقرار الضريبي',
      description:
        'ملخص شامل لكل ما يتعلق بالضرائب في النظام، بحيث يساعدك على البقاء متوافقًا مع متطلبات هيئة الزكاة والدخل.',
      icon: 'pi pi-file',
      iconColor: 'text-red-500',
      lastUpdate: '06/10/2025',
    },
    {
      id: 'vat-summary',
      title: 'ملخص ضريبة القيمة المضافة',
      description: 'عرض تفصيلي لمبالغ الضريبة المحصلة والمدفوعة لتسهيل إعداد الإقرار الضريبي.',
      icon: 'pi pi-percentage',
      iconColor: 'text-green-500',
      lastUpdate: '06/10/2025',
    },
    {
      id: 'tax-adjustments',
      title: 'تسويات الضرائب',
      description: 'تحليل شامل للتسويات الضريبية الناتجة عن فروقات الفواتير أو التصحيحات المحاسبية.',
      icon: 'pi pi-refresh',
      iconColor: 'text-blue-500',
      lastUpdate: '06/10/2025',
    },
        ];
    }
}
