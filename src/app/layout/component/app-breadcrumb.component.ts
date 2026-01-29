import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subject, combineLatest } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, BreadcrumbModule],
  template: `
        <div class="breadcrumb-container">
      <p-breadcrumb
        [model]="items"
        [home]="home">
      </p-breadcrumb>
    </div>
  `,

})
export class AppBreadcrumbComponent implements OnInit, OnDestroy {

  items: MenuItem[] = [];
  isRtl = false;

  home: MenuItem = {
    icon: 'pi pi-home',
    routerLink: '/'
  };

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.router.events.pipe(filter(e => e instanceof NavigationEnd)),
      this.translate.onLangChange
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.rebuildBreadcrumb();
    });

    this.rebuildBreadcrumb();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private rebuildBreadcrumb(): void {
    this.isRtl = this.translate.currentLang === 'ar';

    const tempItems: MenuItem[] = [];
    this.buildBreadcrumb(this.route.root, '', tempItems);

    this.items = this.isRtl
      ? tempItems.reverse()
      : tempItems;
  }

  private buildBreadcrumb(
    route: ActivatedRoute,
    url: string,
    result: MenuItem[]
  ): void {
    for (const child of route.children) {
      const routeConfig = child.snapshot.routeConfig;

      if (!routeConfig || routeConfig.path === '') {
        this.buildBreadcrumb(child, url, result);
        continue;
      }

      const nextUrl = `${url}/${routeConfig.path}`;

      const labelKey = child.snapshot.data['breadcrumb'];
      if (labelKey) {
        this.translate.get(labelKey)
          .pipe(takeUntil(this.destroy$))
          .subscribe(label => {
            result.push({
              label,
              routerLink: nextUrl
            });

            // تحديث القائمة بعد وصول الترجمة
            this.items = this.isRtl
              ? [...result].reverse()
              : [...result];
          });
      }

      this.buildBreadcrumb(child, nextUrl, result);
    }
  }
}