import { Routes } from '@angular/router';

export const BOOK_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./book-list/').then((m) => m.BookListComponent),
    },
    {
        path: 'list',
        loadComponent: () => import('./book-list/').then((m) => m.BookListComponent),
    },
    {
        path: 'create',
        loadComponent: () => import('./book-detail/').then((m) => m.BookDetailComponent),
    },
    {
        path: 'display/:id',
        loadComponent: () => import('./book-detail/').then((m) => m.BookDetailComponent),
    },

];
