// src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideHttpClient, withFetch, HttpClient } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader, TRANSLATE_HTTP_LOADER_CONFIG } from '@ngx-translate/http-loader';

import { appRoutes } from './app.routes';
import { LoadingInterceptor } from '@/core/loading-interceptor';

/* 🔹 إعداد Config للترجمة */
export const translateLoaderConfig = {
  http: null as unknown as HttpClient,  // سيتم تمريره لاحقًا
  prefix: './assets/i18n/',
  suffix: '.json'
};

/* 🔹 Factory للـ Loader */
export function HttpLoaderFactory() {
  return new TranslateHttpLoader(); // ✅ بدون أي arguments
}

/* ==================== Application Config ==================== */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(withFetch()),
    provideAnimationsAsync(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true
    },

    providePrimeNG({
      theme: {
        preset: Aura,
        options: { darkModeSelector: '.app-dark' }
      }
    }),

    /* 🔹 تمرير Config للـ Translate Loader */
    { provide: TRANSLATE_HTTP_LOADER_CONFIG, useValue: translateLoaderConfig },

    /* 🔹 استيراد TranslateModule */
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [TRANSLATE_HTTP_LOADER_CONFIG, HttpClient] // يتم حقن HttpClient و config
        }
      })
    )
  ]
};
