import { Routes } from '@angular/router';

export const LIBRARY_ROUTES: Routes = [
    {
        path: 'book',
        loadChildren: () => import('./book/book.routes').then(m => m.BOOK_ROUTES)
    },
    {
        path: 'borrowrecord',
        loadComponent: () => import('./borrow-record-list/').then(m => m.BorrowRecordListComponent),
    },
    {
        path: 'location',
        loadChildren: () => import('./location/location.routes').then(m => m.LOCATION_ROUTES)
    },
    {
        path: 'person',
        loadChildren: () => import('./person/person.routes').then(m => m.PERSON_ROUTES)
    },
    {
        path: 'organization',
        loadChildren: () => import('./organization/organization.routes').then(m => m.ORGANIZATION_ROUTES)
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
