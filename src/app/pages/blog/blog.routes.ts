import { Routes } from '@angular/router';

export const BLOG_ROUTES: Routes = [
    {
        path: 'post',
        loadComponent: () => import('./post-list/').then((m) => m.PostListComponent),
        children: [
            {
                path: 'create',
                loadComponent: () => import('./post-detail/').then((m) => m.PostDetailComponent),
            },
            {
                path: 'display/:id',
                loadComponent: () => import('./post-detail/').then((m) => m.PostDetailComponent),
            },
            {
                path: 'edit/:id',
                loadComponent: () => import('./post-detail/').then((m) => m.PostDetailComponent),
            }
        ]
    },
    {
        path: 'collection',
        loadComponent: () => import('./collection-list/').then((m) => m.CollectionListComponent),
        children: [
            {
                path: 'create',
                loadComponent: () => import('./collection-detail/').then((m) => m.CollectionDetailComponent),
            },
            {
                path: 'display/:id',
                loadComponent: () => import('./collection-detail/').then((m) => m.CollectionDetailComponent),
            },
            {
                path: 'edit/:id',
                loadComponent: () => import('./collection-detail/').then((m) => m.CollectionDetailComponent),
            },
        ]
    },
    {
        path: 'setting',
        loadChildren: () => import('./user-setting').then((m) => m.UserSettingComponent),
    }
];
