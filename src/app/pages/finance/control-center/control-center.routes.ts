import { Routes } from '@angular/router';

export const CONTROL_CENTER_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./control-center-hierarchy').then((m) => m.ControlCenterHierarchyComponent),
    },
    {
        path: 'hierarchy',
        loadComponent: () => import('./control-center-hierarchy').then((m) => m.ControlCenterHierarchyComponent),
    },
    {
        path: 'list',
        loadComponent: () => import('./control-center-list').then((m) => m.ControlCenterListComponent),
    },
    {
        path: 'create',
        loadComponent: () => import('./control-center-detail').then((m) => m.ControlCenterDetailComponent),
    },
    {
        path: 'display/:id',
        loadComponent: () => import('./control-center-detail').then((m) => m.ControlCenterDetailComponent),
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./control-center-detail').then((m) => m.ControlCenterDetailComponent),
    },
];
