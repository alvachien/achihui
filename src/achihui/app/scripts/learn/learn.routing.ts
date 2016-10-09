import { Routes, RouterModule } from '@angular/router';
import { LearnComponent } from './learn.component';

export const learnRoutes: Routes = [
    {
        path: 'learn',
        component: LearnComponent,
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

export const learnProviders = [
    //AuthGuard,
    //AuthService
];

export const learnRouting = RouterModule.forChild(learnRoutes);
