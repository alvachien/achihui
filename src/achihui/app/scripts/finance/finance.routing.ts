import { Routes, RouterModule } from '@angular/router';
import { FinanceComponent } from './finance.component';

export const financeRoutes: Routes = [
    {
        path: 'finance',
        component: FinanceComponent,
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

export const financeProviders = [
    //AuthGuard,
    //AuthService
];

export const financeRouting = RouterModule.forChild(financeRoutes);
