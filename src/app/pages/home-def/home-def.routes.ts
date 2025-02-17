import { Routes } from '@angular/router';

export const HOMEDEF_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./home-def-list').then((m) => m.HomeDefListComponent),
    },
    {
        path: 'list',
        loadComponent: () => import('./home-def-list').then((m) => m.HomeDefListComponent),
    },
    {
        path: 'create',
        loadComponent: () => import('./home-def-detail').then((m) => m.HomeDefDetailComponent),
    },
    {
        path: 'display/:id',
        loadComponent: () => import('./home-def-detail').then((m) => m.HomeDefDetailComponent),
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./home-def-detail').then((m) => m.HomeDefDetailComponent),
    },
];
