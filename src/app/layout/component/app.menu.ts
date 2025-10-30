import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/'] }
                ]
            },

            {
                routerLink: ['/pages'],
                items: [
                    {
                        label: 'Sales & Customers',
                        icon: 'pi pi-shopping-cart',
                        items: [
                            { label: 'POS', icon: 'pi pi-desktop', routerLink: ['/pages/pos'] },
                            { label: 'Cash Registers', icon: 'pi pi-briefcase', routerLink: ['/pages/pos-management'] },
                            { label: 'Sales Invoices', icon: 'pi pi-file', routerLink: ['/pages/sales-invoices'] },
                            { label: 'Store Orders', icon: 'pi pi-shopping-bag', routerLink: ['/pages/orders'] },
                            { label: 'Customers', icon: 'pi pi-users', routerLink: ['/pages/CRM'] },
                              { label: 'Customer Payments', icon: 'pi pi-users', routerLink: ['/pages/payments'] },
                       
                        ]
                    }
                ]
            },

            {
                routerLink: ['/pages'],
                items: [
                    {
                        label: 'Products & Inventory',
                        icon: 'pi pi-box',
                        items: [
                            { label: 'Products', icon: 'pi pi-tags', routerLink: ['/pages/crud'] },
                            { label: 'Inventory Stock', icon: 'pi pi-check-square', routerLink: ['/pages/inventory'] },
                            { label: 'Stock Transfer', icon: 'pi pi-refresh', routerLink: ['/pages/stock-transfer'] },
                        ]
                    }
                ]
            },

            {
                routerLink: ['/pages'],
                items: [
                    {
                        label: 'Purchases & Suppliers',
                        icon: 'pi pi-truck',
                        items: [
                            { label: 'Purchase Invoices', icon: 'pi pi-file-import', routerLink: ['/pages/purchase-invoices'] },
                            { label: 'Purchase Returns', icon: 'pi pi-undo', routerLink: ['/pages/purchase-returns'] },
                            { label: 'Suppliers', icon: 'pi pi-users', routerLink: ['/pages/suppliers'] },
                            { label: 'Supplier Payments', icon: 'pi pi-wallet', routerLink: ['/pages/supplier-payments'] },
                        ]
                    }
                ]
            },

            {
                label: 'Accounting',
                items: [
                    { label: 'Journal Entries', icon: 'pi pi-list', routerLink: ['/pages/journal-entries'] },
                    { label: 'Trial Balance', icon: 'pi pi-chart-bar', routerLink: ['/pages/trial-balance'] },
                    { label: 'Profit & Loss', icon: 'pi pi-chart-line', routerLink: ['/pages/profit-loss'] },
                    { label: 'Accounts Manager', icon: 'pi pi-sitemap', routerLink: ['/pages/accounts-manager'] },
                ]
            },

            {
                label: 'Reports',
                items: [
                    { label: 'Reports', icon: 'pi pi-chart-pie', routerLink: ['/pages/reports'] },
                    { label: 'Financial Reports', icon: 'pi pi-file', routerLink: ['/pages/financial-report'] },
                ]
            },

            {
                label: 'UI Components',
                items: [
                    { label: 'Form Layout', icon: 'pi pi-fw pi-id-card', routerLink: ['/uikit/formlayout'] },
                    { label: 'Input', icon: 'pi pi-fw pi-check-square', routerLink: ['/uikit/input'] },
                    { label: 'Button', icon: 'pi pi-fw pi-mobile', class: 'rotated-icon', routerLink: ['/uikit/button'] },
                    { label: 'Table', icon: 'pi pi-fw pi-table', routerLink: ['/uikit/table'] },
                    { label: 'List', icon: 'pi pi-fw pi-list', routerLink: ['/uikit/list'] },
                    { label: 'Tree', icon: 'pi pi-fw pi-share-alt', routerLink: ['/uikit/tree'] },
                    { label: 'Panel', icon: 'pi pi-fw pi-tablet', routerLink: ['/uikit/panel'] },
                    { label: 'Overlay', icon: 'pi pi-fw pi-clone', routerLink: ['/uikit/overlay'] },
                    { label: 'Media', icon: 'pi pi-fw pi-image', routerLink: ['/uikit/media'] },
                    { label: 'Menu', icon: 'pi pi-fw pi-bars', routerLink: ['/uikit/menu'] },
                    { label: 'Message', icon: 'pi pi-fw pi-comment', routerLink: ['/uikit/message'] },
                    { label: 'File', icon: 'pi pi-fw pi-file', routerLink: ['/uikit/file'] },
                    { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/uikit/charts'] },
                    { label: 'Timeline', icon: 'pi pi-fw pi-calendar', routerLink: ['/uikit/timeline'] },
                    { label: 'Misc', icon: 'pi pi-fw pi-circle', routerLink: ['/uikit/misc'] }
                ]
            },

            {
                label: 'Pages',
                icon: 'pi pi-fw pi-briefcase',
                routerLink: ['/pages'],
                items: [
                    { label: 'Landing', icon: 'pi pi-fw pi-globe', routerLink: ['/landing'] },
                    {
                        label: 'Auth', icon: 'pi pi-fw pi-user',
                        items: [
                            { label: 'Login', icon: 'pi pi-fw pi-sign-in', routerLink: ['/auth/login'] },
                            { label: 'Error', icon: 'pi pi-fw pi-times-circle', routerLink: ['/auth/error'] },
                            { label: 'Access Denied', icon: 'pi pi-fw pi-lock', routerLink: ['/auth/access'] },
                        ]
                    },
                    { label: 'Not Found', icon: 'pi pi-fw pi-exclamation-circle', routerLink: ['/pages/notfound'] },
                    { label: 'Empty', icon: 'pi pi-fw pi-circle-off', routerLink: ['/pages/empty'] }
                ]
            },

            {
                label: 'Hierarchy',
                items: [
                    {
                        label: 'Submenu 1', icon: 'pi pi-fw pi-bookmark',
                        items: [
                            {
                                label: 'Submenu 1.1', icon: 'pi pi-fw pi-bookmark',
                                items: [
                                    { label: 'Submenu 1.1.1', icon: 'pi pi-fw pi-bookmark' },
                                    { label: 'Submenu 1.1.2', icon: 'pi pi-fw pi-bookmark' },
                                    { label: 'Submenu 1.1.3', icon: 'pi pi-fw pi-bookmark' }
                                ]
                            },
                            {
                                label: 'Submenu 1.2', icon: 'pi pi-fw pi-bookmark',
                                items: [{ label: 'Submenu 1.2.1', icon: 'pi pi-fw pi-bookmark' }]
                            }
                        ]
                    },
                    {
                        label: 'Submenu 2', icon: 'pi pi-fw pi-bookmark',
                        items: [
                            {
                                label: 'Submenu 2.1', icon: 'pi pi-fw pi-bookmark',
                                items: [
                                    { label: 'Submenu 2.1.1', icon: 'pi pi-fw pi-bookmark' },
                                    { label: 'Submenu 2.1.2', icon: 'pi pi-fw pi-bookmark' }
                                ]
                            },
                            {
                                label: 'Submenu 2.2', icon: 'pi pi-fw pi-bookmark',
                                items: [{ label: 'Submenu 2.2.1', icon: 'pi pi-fw pi-bookmark' }]
                            }
                        ]
                    }
                ]
            },

            {
                label: 'Get Started',
                items: [
                    { label: 'Documentation', icon: 'pi pi-fw pi-pencil', routerLink: ['/documentation'] },
                    { label: 'View Source', icon: 'pi pi-fw pi-github', url: 'https://github.com/primefaces/sakai-ng', target: '_blank' }
                ]
            }
        ];
    }
}
