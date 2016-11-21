import { Routes, RouterModule } from '@angular/router';
import { EventComponent } from './event.component';
import { EventListComponent } from './event.list.component';
import { EventDetailComponent } from './event.detail.component';

export const eventRoutes: Routes = [
    {
        path: 'event',
        component: EventComponent,
        children: [
            { path: '', redirectTo: 'list', pathMatch: 'full' },
            {
                path: 'list',
                component: EventListComponent
            },
            {
                path: 'create',
                component: EventDetailComponent,
                data: {
                    uimode: 1
                }
            },
            {
                path: 'change/:id',
                component: EventDetailComponent,
                data: {
                    uimode: 2
                }
            },
            {
                path: 'display/:id',
                component: EventDetailComponent,
                data: {
                    uimode: 3
                }
            }
            //{
            //    path: 'detail/:id',
            //    component: AlbumDetailComponent,
            //    //canDeactivate: [CanDeactivateGuard],
            //    //resolve: {
            //    //    album: AlbumDetailResolve
            //    //}
            //},
            //{
            //    path: 'orgphoto/:id',
            //    component: AlbumOrgPhotoComponent,
            //},
            //{
            //    path: '',
            //    component: AlbumListComponent
            //},
        ]
    }
];

export const eventProviders = [
    //AuthGuard,
    //AuthService
];

export const eventRouting = RouterModule.forChild(eventRoutes);
