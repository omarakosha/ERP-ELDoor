import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader, TRANSLATE_HTTP_LOADER_CONFIG } from '@ngx-translate/http-loader';

/* 🔹 إعداد Config للترجمة */
export const translateLoaderConfig = {
  http: null as unknown as HttpClient,  // سيتم تمريره في الـ deps
  prefix: './assets/i18n/',
  suffix: '.json'
};

/* 🔹 Factory للـ Loader */
export function HttpLoaderFactory() {
  return new TranslateHttpLoader(); // ✅ بدون أي arguments
}