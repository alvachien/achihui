import { Routes } from '@angular/router';

export const LOCATION_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./location-list').then((m) => m.LocationListComponent),
    },
    {
        path: 'location',
        loadComponent: () => import('./location-list').then((m) => m.LocationListComponent),
    },
    {
        path: 'create',
        loadComponent: () => import('./location-detail/').then((m) => m.LocationDetailComponent),
    },
    {
        path: 'display/:id',
        loadComponent: () => import('./location-detail/').then((m) => m.LocationDetailComponent),
    },
];
