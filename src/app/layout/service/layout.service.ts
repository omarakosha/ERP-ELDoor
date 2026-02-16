import { Injectable, effect, signal, computed } from '@angular/core';
import { Subject } from 'rxjs';

export interface layoutConfig {
    preset?: string;
    primary?: string;
    surface?: string | undefined | null;
    darkTheme?: boolean;
    themeMode?: 'light' | 'dark' | 'system';   // ⭐ جديد
    menuMode?: string;
    lang?: 'ar' | 'en';
}

interface LayoutState {
    staticMenuDesktopInactive?: boolean;
    overlayMenuActive?: boolean;
    configSidebarVisible?: boolean;
    staticMenuMobileActive?: boolean;
    menuHoverActive?: boolean;
}

interface MenuChangeEvent {
    key: string;
    routeEvent?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class LayoutService {

    private lastLang?: 'ar' | 'en';

    private _config: layoutConfig = {
        preset: 'Aura',
        primary: 'emerald',
        surface: null,
        darkTheme: false,
        themeMode: 'system',   // ⭐ افتراضي System
        menuMode: 'static',
        lang: 'ar'
    };

    private _state: LayoutState = {
        staticMenuDesktopInactive: false,
        overlayMenuActive: false,
        configSidebarVisible: false,
        staticMenuMobileActive: false,
        menuHoverActive: false
    };

    layoutConfig = signal<layoutConfig>(this._config);
    layoutState = signal<LayoutState>(this._state);

    private configUpdate = new Subject<layoutConfig>();
    private overlayOpen = new Subject<any>();
    private menuSource = new Subject<MenuChangeEvent>();
    private resetSource = new Subject<void>();

    menuSource$ = this.menuSource.asObservable();
    resetSource$ = this.resetSource.asObservable();
    configUpdate$ = this.configUpdate.asObservable();
    overlayOpen$ = this.overlayOpen.asObservable();

    isDarkTheme = computed(() => this.layoutConfig().darkTheme);
    isOverlay = computed(() => this.layoutConfig().menuMode === 'overlay');

    transitionComplete = signal<boolean>(false);
    private initialized = false;

    constructor() {

        // ===== تحميل الإعداد المحفوظ =====
        const savedTheme = localStorage.getItem('app-theme-mode') as 'light' | 'dark' | 'system' | null;

        if (savedTheme) {
            this.layoutConfig.update(c => ({
                ...c,
                themeMode: savedTheme
            }));
        }

        this.applyTheme();

        // ===== مراقبة تغيير النظام =====
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        mediaQuery.addEventListener('change', () => {
            if (this.layoutConfig().themeMode === 'system') {
                this.applyTheme();
            }
        });

        // ===== effects =====
        effect(() => {
            const config = this.layoutConfig();
            if (config) this.onConfigUpdate();
        });

        effect(() => {
            const config = this.layoutConfig();

            if (!this.initialized || !config) {
                this.initialized = true;
                return;
            }

            this.handleDarkModeTransition(config);
        });
    }

    // =========================================================
    // 🎯 THEME LOGIC
    // =========================================================

    setThemeMode(mode: 'light' | 'dark' | 'system') {
        localStorage.setItem('app-theme-mode', mode);

        this.layoutConfig.update(c => ({
            ...c,
            themeMode: mode
        }));

        this.applyTheme();
    }

    private applyTheme() {

        const config = this.layoutConfig();
        let isDark = false;

        if (config.themeMode === 'dark') {
            isDark = true;
        }
        else if (config.themeMode === 'light') {
            isDark = false;
        }
        else {
            // system
            isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        this.layoutConfig.update(c => ({
            ...c,
            darkTheme: isDark
        }));
    }

    private handleDarkModeTransition(config: layoutConfig): void {
        if ((document as any).startViewTransition) {
            this.startViewTransition(config);
        } else {
            this.toggleDarkMode(config);
            this.onTransitionEnd();
        }
    }

    private startViewTransition(config: layoutConfig): void {
        const transition = (document as any).startViewTransition(() => {
            this.toggleDarkMode(config);
        });

        transition.ready
            .then(() => this.onTransitionEnd())
            .catch(() => {});
    }

    private toggleDarkMode(config?: layoutConfig): void {
        const _config = config || this.layoutConfig();

        if (_config.darkTheme) {
            document.documentElement.classList.add('app-dark');
        } else {
            document.documentElement.classList.remove('app-dark');
        }
    }

    private onTransitionEnd() {
        this.transitionComplete.set(true);
        setTimeout(() => this.transitionComplete.set(false));
    }

    // =========================================================
    // 🎯 MENU
    // =========================================================

    onMenuToggle() {
        if (this.isOverlay()) {
            this.layoutState.update(prev => ({
                ...prev,
                overlayMenuActive: !prev.overlayMenuActive
            }));

            if (this.layoutState().overlayMenuActive)
                this.overlayOpen.next(null);
        }

        if (this.isDesktop()) {
            this.layoutState.update(prev => ({
                ...prev,
                staticMenuDesktopInactive: !prev.staticMenuDesktopInactive
            }));
        } else {
            this.layoutState.update(prev => ({
                ...prev,
                staticMenuMobileActive: !prev.staticMenuMobileActive
            }));

            if (this.layoutState().staticMenuMobileActive)
                this.overlayOpen.next(null);
        }
    }

    isDesktop() {
        return window.innerWidth > 991;
    }

    isMobile() {
        return !this.isDesktop();
    }

    // =========================================================
    // 🎯 LANGUAGE RTL
    // =========================================================

    onConfigUpdate() {

        const currentLang = this.layoutConfig().lang;
        const isRtl = currentLang === 'ar';

        if (this.lastLang !== currentLang) {
            document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
            document.documentElement.classList.toggle('rtl', isRtl);
            this.lastLang = currentLang;
        }

        this.configUpdate.next(this.layoutConfig());
    }

    // =========================================================

    onMenuStateChange(event: MenuChangeEvent) {
        this.menuSource.next(event);
    }

    reset() {
        this.resetSource.next();
    }
}
