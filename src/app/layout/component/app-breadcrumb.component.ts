import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

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
styles: [`
  .breadcrumb-container {
    padding: 0.75rem 1rem;
    background: var(--surface-card);
    border-bottom: 1px solid var(--surface-border);

    /* الحواف المدورة */
    border-radius: 8px; /* يمكنك تغيير القيمة حسب الرغبة */

    /* مسافة من الأعلى */
    margin-top: 0rem;

    /* مسافة من الأسفل */
    margin-bottom: 1rem;
  }
`]

})
export class AppBreadcrumbComponent implements OnInit {

  items: MenuItem[] = [];

  home: MenuItem = {
    icon: 'pi pi-home',
    routerLink: '/'
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.items = [];
        this.buildBreadcrumb(this.route.root, '');
      });
  }

  private buildBreadcrumb(route: ActivatedRoute, url: string) {
    const children = route.children;

    for (const child of children) {
      const routeConfig = child.snapshot.routeConfig;

      if (!routeConfig) continue; // تخطي المسارات الغير معرفة

      const path = routeConfig.path;
      if (path) {
        url += `/${path}`;
      }

      const labelKey = child.snapshot.data['breadcrumb'];
      if (labelKey) {
        this.items.push({
          label: this.translate.instant(labelKey), // لدعم الترجمة
          routerLink: url
        });
      }

      // استدعاء بشكل recursive للأطفال
      this.buildBreadcrumb(child, url);
    }
  }
}
