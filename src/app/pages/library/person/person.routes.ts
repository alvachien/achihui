import { Routes } from '@angular/router';

export const PERSON_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./person-list').then((m) => m.PersonListComponent),
    },
    {
        path: 'person',
        loadComponent: () => import('./person-list').then((m) => m.PersonListComponent),
    },
    {
        path: 'create',
        loadComponent: () => import('./person-detail/').then((m) => m.PersonDetailComponent),
    },
    {
        path: 'display/:id',
        loadComponent: () => import('./person-detail/').then((m) => m.PersonDetailComponent),
    },

];
