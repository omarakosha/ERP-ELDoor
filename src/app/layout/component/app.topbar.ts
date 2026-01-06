import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';

import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuModule } from 'primeng/menu';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    StyleClassModule,
    AppConfigurator,
    MenuModule,
    TranslateModule // ✅ Pipe translate متاحة هنا
  ],
  template: `
<!-- ==========================
   🌐 Topbar (RTL / LTR Fully Compatible)
========================== -->
<div class="layout-topbar flex justify-between items-center px-4 py-2 bg-white shadow-sm relative">

  <!-- ======= Logo & Menu Button ======= -->
  <div class="flex items-center gap-2">
    <!-- Menu Toggle -->
    <button
      class="layout-menu-button layout-topbar-action p-2"
      (click)="layoutService.onMenuToggle()"
      title="Toggle Menu"
    >
      <i class="pi pi-bars text-lg"></i>
    </button>

    <!-- Logo -->
    <a class="layout-topbar-logo flex items-center gap-2" routerLink="/">
      <!-- شعار الدُّرّ -->
      <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" class="w-8 h-8">
        <path d="M32 6C20 6 8 16 8 28c0 10 10 18 24 18s24-8 24-18C56 16 44 6 32 6z"
              fill="var(--primary-color)" opacity="0.8"/>
        <circle cx="32" cy="32" r="8" fill="white" stroke="var(--primary-color)" stroke-width="2"/>
        <circle cx="30" cy="30" r="3" fill="rgba(255,255,255,0.7)"/>
      </svg>
      <span class="font-bold text-xl text-primary">الــدُّرّ</span>
    </a>
  </div>

  <!-- ======= Topbar Actions ======= -->
  <div class="flex items-center gap-3">

    <!-- ======= Language Toggle ======= -->
    <div class="flex items-center gap-1" [dir]="currentLang === 'ar' ? 'rtl' : 'ltr'">
      <span
        (click)="toggleLanguage()"
        class="cursor-pointer hover:text-primary transition-colors duration-200 font-medium hidden sm:inline"
        title="Change Language"
      >
        {{ currentLang === 'ar' ? 'English' : 'العربية' }}
      </span>
      
      <button
        type="button"
        class="layout-topbar-action p-0"
        (click)="toggleLanguage()"
        title="Change Language"
      >
        <i class="pi pi-globe"></i>
      </button>
    </div>
    
    
    <!-- ======= Configurator / Palette ======= -->
    <div class="relative"dir="rtl">
      <button
        class="layout-topbar-action layout-topbar-action-highlight"
        pStyleClass="@next"
        enterFromClass="hidden"
        enterActiveClass="animate-scalein"
        leaveToClass="hidden"
        leaveActiveClass="animate-fadeout"
        [hideOnOutsideClick]="true"
        title="Settings"
      >
        <i class="pi pi-palette"></i>
      </button>
      <app-configurator></app-configurator>
    </div>


    <!-- ======= Dark Mode Toggle ======= -->
    <button
      type="button"
      class="layout-topbar-action"
      (click)="toggleDarkMode()"
      title="Toggle Dark Mode"
    >
      <i [ngClass]="{'pi': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme()}"></i>
    </button>

    <!-- ======= Topbar Menu ======= -->
    <div class="layout-topbar-menu hidden lg:flex gap-2">
      <button type="button" class="layout-topbar-action">
        <i class="pi pi-calendar"></i>
        <span>{{ 'topbar.calendar' | translate }}</span>
      </button>

      <button type="button" class="layout-topbar-action">
        <i class="pi pi-inbox"></i>
        <span>{{ 'topbar.messages' | translate }}</span>
      </button>

      <button type="button" class="layout-topbar-action">
        <i class="pi pi-user"></i>
        <span>{{ 'topbar.profile' | translate }}</span>
      </button>
    </div>

    <!-- ======= Mobile Menu Button ======= -->
    <button
      class="layout-topbar-menu-button layout-topbar-action lg:hidden"
      pStyleClass="@next"
      enterFromClass="hidden"
      enterActiveClass="animate-scalein"
      leaveToClass="hidden"
      leaveActiveClass="animate-fadeout"
      [hideOnOutsideClick]="true"
      title="More"
    >
      <i class="pi pi-ellipsis-v"></i>
    </button>
    

  </div>
</div>

  `
})
export class AppTopbar {
  items!: MenuItem[];
  currentLang: string;

  constructor(
    public layoutService: LayoutService,
    private translate: TranslateService
  ) {
    // تعيين اللغة الحالية / fallback
    this.currentLang = 'ar';
    this.translate.setDefaultLang('ar');
    this.translate.use(this.currentLang);
    document.documentElement.dir = 'rtl';
  }

  toggleDarkMode() {
    this.layoutService.layoutConfig.update(state => ({ ...state, darkTheme: !state.darkTheme }));
  }

  toggleLanguage() {
    const newLang = this.currentLang === 'ar' ? 'en' : 'ar';
    this.currentLang = newLang;

    this.translate.use(newLang);

    // تحديث direction على html
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';

    this.layoutService.layoutConfig.update(cfg => ({
      ...cfg,
      lang: newLang
    }));
  }

}
