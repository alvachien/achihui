import { Routes } from '@angular/router';

export const PLAN_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./plan-list/').then((m) => m.PlanListComponent),
    },
    {
        path: 'list',
        loadComponent: () => import('./plan-list/').then((m) => m.PlanListComponent),
    },
    {
        path: 'create',
        loadComponent: () => import('./plan-detail/').then((m) => m.PlanDetailComponent),
    },
    {
        path: 'display/:id',
        loadComponent: () => import('./plan-detail/').then((m) => m.PlanDetailComponent),
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./plan-detail/').then((m) => m.PlanDetailComponent),
    },

];
