import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'  // هذا يجعل Angular يوفر الخدمة تلقائيًا
})

export class SalesReportsService {
    getData() {
        return [
            {
      id: 'customer-payments',
      title: 'تقرير مدفوعات العملاء',
      description: 'كشف حساب مدين متكامل لعملائك في رواء مع جميع التعاملات والمدفوعات.',
      icon: 'pi pi-wallet',
      iconColor: 'text-purple-500',
      lastUpdate: '06/10/2025',
    },
    {
      id: 'sales-per-location',
      title: 'تقرير المبيعات لكل موقع',
      description: 'تعرف على مبيعاتك بحسب كل فرع لمعرفة الفروع الأكثر تحقيقا للدخل والكميات المباعة.',
      icon: 'pi pi-chart-line',
      iconColor: 'text-blue-500',
      lastUpdate: '06/10/2025',
    },
    {
      id: 'sales-by-category',
      title: 'المبيعات حسب الفئات',
      description: 'اعرف أي تصنيف يبيع أكثر لديك بناءً على تصنيفات المنتجات في المخزون.',
      icon: 'pi pi-tags',
      iconColor: 'text-green-500',
      lastUpdate: '06/10/2025',
    },
    {
      id: 'sales-per-invoice',
      title: 'تقرير المبيعات مِن كل فاتورة',
      description: 'متابعة مبيعاتك لكل فاتورة مع معرفة المبالغ والضرائب المتعلقة بها.',
      icon: 'pi pi-file',
      iconColor: 'text-red-500',
      lastUpdate: '06/10/2025',
    },
    {
      id: 'sales-per-employee',
      title: 'تقرير المبيعات من كل موظف',
      description: 'راقب أداء موظفيك من خلال معرفة المبيعات الكلية لكل موظف.',
      icon: 'pi pi-users',
      iconColor: 'text-yellow-500',
      lastUpdate: '06/10/2025',
    },
    {
      id: 'sales-by-payment-status',
      title: 'تقرير المبيعات لكل حالة دفع',
      description: 'تصنيف المبيعات بحسب حالة الدفع لمعرفة الفواتير المدفوعة أو غير المدفوعة أو الجزئية.',
      icon: 'pi pi-credit-card',
      iconColor: 'text-indigo-500',
      lastUpdate: '06/10/2025',
    },
    {
      id: 'sales-per-customer',
      title: 'تقرير المبيعات من كل عميل',
      description: 'تفصيل كامل لمبيعاتك بحسب كل عميل لمعرفة الأكثر ولاءً وإجمالي الربح.',
      icon: 'pi pi-user',
      iconColor: 'text-pink-500',
      lastUpdate: '06/10/2025',
    },
    {
      id: 'sales-per-channel',
      title: 'تقرير المبيعات من كل قناة بيع',
      description: 'حلل المبيعات لكل قناة بيع لمعرفة الأكثر فعالية.',
      icon: 'pi pi-globe',
      iconColor: 'text-teal-500',
      lastUpdate: '06/10/2025',
    },
    {
      id: 'customer-transactions',
      title: 'تقرير معاملات العملاء',
      description: 'تتبع العمليات التي قام بها العميل في متجرك.',
      icon: 'pi pi-exchange',
      iconColor: 'text-orange-500',
      lastUpdate: '06/10/2025',
    },
    {
      id: 'transactions-per-location',
      title: 'تقرير المعاملات في كل موقع',
      description: 'تحقق من العمليات الخاصة بالمواقع المختلفة.',
      icon: 'pi pi-map',
      iconColor: 'text-cyan-500',
      lastUpdate: '05/10/2025',
    },
    {
      id: 'products-sold-per-customer',
      title: 'تقرير المنتجات المباعة للعميل',
      description: 'تعرف على المنتجات الأكثر شراءً لكل عميل والكميات التي تم شراؤها.',
      icon: 'pi pi-box',
      iconColor: 'text-lime-500',
      lastUpdate: '06/10/2025',
    },
    {
      id: 'sales-by-period',
      title: 'تقرير المبيعات حسب الفترة الزمنية',
      description: 'تقرير كامل بمبيعاتك مع رسوم بيانية وجداول مفصلة لكل فترة زمنية.',
      icon: 'pi pi-calendar',
      iconColor: 'text-red-500',
      lastUpdate: '06/10/2025',
    },
    {
      id: 'sales-by-payment-method',
      title: 'المبيعات من طرق الدفع',
      description: 'معرفة المبالغ المحصلة من كل عملية سواء نقدية أو طرق الدفع الأخرى.',
      icon: 'pi pi-credit-card',
      iconColor: 'text-indigo-500',
      lastUpdate: '06/10/2025',
    },
        ];
    }
}
