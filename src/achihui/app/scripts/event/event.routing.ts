import { Routes, RouterModule } from '@angular/router';
import { EventComponent } from './event.component';

export const eventRoutes: Routes = [
    {
        path: 'event',
        component: EventComponent,
        children: [
            //{
            //    path: 'create',
            //    component: AlbumCreateComponent
            //},
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
