import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `
    <ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator"
                [item]="item"
                [index]="i"
                [root]="true">
            </li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul>
    `
})
export class AppMenu {

    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [

            // ================= Home =================
            {
                label: 'MENU.HOME',
                items: [
                    {
                        label: 'MENU.DASHBOARD',
                        icon: 'pi pi-home',
                        routerLink: ['/']
                    }
                ]
            },

            // ================= Sales & Customers =================
            {
                items: [
                    {
                        label: 'MENU.SALES_CUSTOMERS',
                        icon: 'pi pi-shopping-cart',
                        items: [
                            { label: 'MENU.POS', icon: 'pi pi-desktop', routerLink: ['/pages/pos'] },
                            { label: 'MENU.CASH_REGISTERS', icon: 'pi pi-briefcase', routerLink: ['/pages/pos-management'] },
                            { label: 'MENU.SALES_INVOICES', icon: 'pi pi-file', routerLink: ['/pages/sales-invoices'] },
                            { label: 'MENU.STORE_ORDERS', icon: 'pi pi-shopping-bag', routerLink: ['/pages/orders'] },
                            { label: 'MENU.CUSTOMERS', icon: 'pi pi-users', routerLink: ['/pages/CRM'] },
                            { label: 'MENU.CUSTOMER_PAYMENTS', icon: 'pi pi-wallet', routerLink: ['/pages/payments'] },
                        ]
                    }
                ]
            },

            // ================= Products & Inventory =================
            {
                items: [
                    {
                        label: 'MENU.PRODUCTS_INVENTORY',
                        icon: 'pi pi-box',
                        items: [
                            { label: 'MENU.PRODUCTS', icon: 'pi pi-tags', routerLink: ['/pages/crud'] },
                            { label: 'MENU.INVENTORY_STOCK', icon: 'pi pi-check-square', routerLink: ['/pages/inventory'] },
                            { label: 'MENU.STOCK_TRANSFER', icon: 'pi pi-refresh', routerLink: ['/pages/stock-transfer'] },
                        ]
                    }
                ]
            },

            // ================= Purchases & Suppliers =================
            {
                items: [
                    {
                        label: 'MENU.PURCHASES_SUPPLIERS',
                        icon: 'pi pi-truck',
                        items: [
                            { label: 'MENU.PURCHASE_INVOICES', icon: 'pi pi-file-import', routerLink: ['/pages/purchase-invoices'] },
                            { label: 'MENU.PURCHASE_RETURNS', icon: 'pi pi-undo', routerLink: ['/pages/purchase-returns'] },
                            { label: 'MENU.SUPPLIERS', icon: 'pi pi-users', routerLink: ['/pages/suppliers'] },
                            { label: 'MENU.SUPPLIER_PAYMENTS', icon: 'pi pi-wallet', routerLink: ['/pages/supplier-payments'] },
                        ]
                    }
                ]
            },

            // ================= Accounting =================
            {
                label: 'MENU.ACCOUNTING',
                items: [
                    { label: 'MENU.TREE_ACCOUNTS', icon: 'pi pi-sitemap', routerLink: ['/pages/accounts-manager'] },
                    { label: 'MENU.JOURNAL_ENTRIES', icon: 'pi pi-list', routerLink: ['/pages/journal-entries'] },
                    { label: 'MENU.TRIAL_BALANCE', icon: 'pi pi-chart-bar', routerLink: ['/pages/trial-balance'] },
                    { label: 'MENU.PROFIT_LOSS', icon: 'pi pi-chart-line', routerLink: ['/pages/profit-loss'] },
                    { label: 'MENU.BALANCE_SHEET', icon: 'pi pi-objects-column', routerLink: ['/pages/balancesheet'] },
                    { label: 'MENU.ENTITY_MANAGER', icon: 'pi pi-sitemap', routerLink: ['/pages/entity'] },
                ]
            },

            // ================= Reports =================
            {
                label: 'MENU.REPORTS',
                items: [
                    { label: 'MENU.ALL_REPORTS', icon: 'pi pi-chart-pie', routerLink: ['/pages/reports'] },
                    { label: 'MENU.FINANCIAL_REPORTS', icon: 'pi pi-file', routerLink: ['/pages/financial-report'] },
                ]
            },






/*
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
            }*/

        ];
    }
}
