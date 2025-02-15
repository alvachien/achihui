import { Routes } from '@angular/router';

export const ACCOUNT_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./account-hierarchy').then((m) => m.AccountHierarchyComponent),
    },
    {
        path: 'list',
        loadComponent: () => import('./account-list').then((m) => m.AccountListComponent),
    },
    {
        path: 'hierarchy',
        loadComponent: () => import('./account-hierarchy').then((m) => m.AccountHierarchyComponent),
    },
    {
        path: 'create',
        loadComponent: () => import('./account-detail').then((m) => m.AccountDetailComponent),
    },
    {
        path: 'display/:id',
        loadComponent: () => import('./account-detail').then((m) => m.AccountDetailComponent),
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./account-detail').then((m) => m.AccountDetailComponent),
    },
];
