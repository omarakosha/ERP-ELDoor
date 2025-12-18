import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    StyleClassModule,
    AppConfigurator,
    TranslateModule // ✅ Pipe translate متاحة هنا
  ],
  template: `
  <div class="layout-topbar">
    <div class="layout-topbar-logo-container">
      <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
        <i class="pi pi-bars"></i>
      </button>

      <a class="layout-topbar-logo" routerLink="/">
        <!-- شعار الدُّرّ -->
        <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <path d="M32 6C20 6 8 16 8 28c0 10 10 18 24 18s24-8 24-18C56 16 44 6 32 6z" fill="var(--primary-color)" opacity="0.8"/>
          <circle cx="32" cy="32" r="8" fill="white" stroke="var(--primary-color)" stroke-width="2"/>
          <circle cx="30" cy="30" r="3" fill="rgba(255,255,255,0.7)"/>
        </svg>
        <span style="font-weight:700; font-size:1.4rem; color:var(--primary-color); margin-right:0.5rem;">
          الــدُّرّ
        </span>
      </a>
    </div>

    <div class="layout-topbar-actions">
      <div class="layout-config-menu">
        <!-- Dark Mode Toggle -->
        <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
          <i [ngClass]="{'pi': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme()}"></i>
        </button>

        <div class="relative">
          <button class="layout-topbar-action layout-topbar-action-highlight"
                  pStyleClass="@next"
                  enterFromClass="hidden"
                  enterActiveClass="animate-scalein"
                  leaveToClass="hidden"
                  leaveActiveClass="animate-fadeout"
                  [hideOnOutsideClick]="true">
            <i class="pi pi-palette"></i>
          </button>
          <app-configurator />
        </div>
      </div>

      <button class="layout-topbar-menu-button layout-topbar-action"
              pStyleClass="@next"
              enterFromClass="hidden"
              enterActiveClass="animate-scalein"
              leaveToClass="hidden"
              leaveActiveClass="animate-fadeout"
              [hideOnOutsideClick]="true">
        <i class="pi pi-ellipsis-v"></i>
      </button>

         <!-- Language Toggle -->
          <button type="button" class="layout-topbar-action" (click)="toggleLanguage()">
            <i class="pi pi-globe"></i>
            <span>{{ currentLang === 'ar' ? 'العربية' : 'English' }}</span>
          </button>

      <!-- Topbar Menu -->
      <div class="layout-topbar-menu hidden lg:block">
        <div class="layout-topbar-menu-content">

      

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
      </div>
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
    this.currentLang = this.currentLang === 'ar' ? 'en' : 'ar';
    this.translate.use(this.currentLang);
    document.documentElement.dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
  }
}
