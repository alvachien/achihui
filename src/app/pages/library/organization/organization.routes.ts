import { Routes } from '@angular/router';

export const ORGANIZATION_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./organization-list').then((m) => m.OrganizationListComponent),
    },
    {
        path: 'organization',
        loadComponent: () => import('./organization-list').then((m) => m.OrganizationListComponent),
    },
    {
        path: 'create',
        loadComponent: () => import('./organization-detail/').then((m) => m.OrganizationDetailComponent),
    },
    {
        path: 'display/:id',
        loadComponent: () => import('./organization-detail/').then((m) => m.OrganizationDetailComponent),
    }

];
