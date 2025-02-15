import { Routes } from '@angular/router';

export const EVENT_ROUTES: Routes = [
    {
        path: 'normal-event',
        loadComponent: () => import('./normal-event-list/').then((m) => m.NormalEventListComponent),
        children: [
            {
                path: 'create',
                loadComponent: () => import('./normal-event-detail/').then((m) => m.NormalEventDetailComponent)
            },
            {
                path: 'display/:id',
                loadComponent: () => import('./normal-event-detail/').then((m) => m.NormalEventDetailComponent)
            },
        ]
    },
    {
        path: 'recur-event',
        loadComponent: () => import('./recur-event-list/').then((m) => m.RecurEventListComponent),
        children: [
            {
                path: 'create',
                loadComponent: () => import('./recur-event-detail/').then((m) => m.RecurEventDetailComponent),
            },
            {
                path: 'display/:id',
                loadComponent: () => import('./recur-event-detail/').then((m) => m.RecurEventDetailComponent),
            },
        ]
    },
    {
        path: 'search',
        loadComponent: () => import('./search/').then((m) => m.SearchComponent),
    }
];
