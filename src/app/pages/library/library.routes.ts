import { Routes } from '@angular/router';

export const LIBRARY_ROUTES: Routes = [
    {
        path: 'book',
        loadComponent: () => import('./book-list/').then((m) => m.BookListComponent),
        children: [
            {
                path: 'create',
                loadComponent: () => import('./book-detail/').then((m) => m.BookDetailComponent),
            },
            {
                path: 'display/:id',
                loadComponent: () => import('./book-detail/').then((m) => m.BookDetailComponent),
            },
        ]
    },
    {
        path: 'borrowrecord',
        loadComponent: () => import('./borrow-record-list/').then((m) => m.BorrowRecordListComponent),
    },
    {
        path: 'location',
        loadComponent: () => import('./location-list/').then((m) => m.LocationListComponent),
        children: [
            {
                path: 'create',
                loadComponent: () => import('./location-detail/').then((m) => m.LocationDetailComponent),
            },
            {
                path: 'display/:id',
                loadComponent: () => import('./location-detail/').then((m) => m.LocationDetailComponent),
            },
        ]
    },
    {
        path: 'person',
        loadComponent: () => import('./person-list/').then((m) => m.PersonListComponent),
        children: [
            {
                path: 'create',
                loadComponent: () => import('./person-detail/').then((m) => m.PersonDetailComponent),
            },
            {
                path: 'display/:id',
                loadComponent: () => import('./person-detail/').then((m) => m.PersonDetailComponent),
            },
        ]
    },
    {
        path: 'organization',
        loadComponent: () => import('./organization-list/').then((m) => m.OrganizationListComponent),
        children: [
            {
                path: 'create',
                loadComponent: () => import('./organization-detail/').then((m) => m.OrganizationDetailComponent),
            },
            {
                path: 'display/:id',
                loadComponent: () => import('./organization-detail/').then((m) => m.OrganizationDetailComponent),
            },
        ]
    },
    {
        path: 'config',
        loadComponent: () => import('./config/config.component').then((m) => m.ConfigComponent),
    },
    {
        path: 'search',
        loadComponent: () => import('./search/').then((m) => m.SearchComponent),
    }

];
