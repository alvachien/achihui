import { Routes } from '@angular/router';

export const ORDER_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./order-list').then((m) => m.OrderListComponent),
    },
    {
        path: 'list',
        loadComponent: () => import('./order-list').then((m) => m.OrderListComponent),
    },
    {
        path: 'create',
        loadComponent: () => import('./order-detail').then((m) => m.OrderDetailComponent),
    },
    {
        path: 'display/:id',
        loadComponent: () => import('./order-detail').then((m) => m.OrderDetailComponent),
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./order-detail').then((m) => m.OrderDetailComponent),
    },

];
