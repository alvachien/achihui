import { Routes, RouterModule } from '@angular/router';
import { LearnComponent } from './learn.component';

import { CategoryListComponent } from './category.list.component';
import { ObjectComponent } from './object.component';
import { ObjectListComponent } from './object.list.component';
import { ObjectDetailComponent } from './object.detail.component';
import { HistoryComponent } from './history.component';
import { HistoryListComponent } from './history.list.component';
import { HistoryDetailComponent } from './history.detail.component';
import { AwardComponent } from './award.component';
import { AwardListComponent } from './award.list.component';
import { AwardDetailComponent } from './award.detail.component';
import { PlanComponent } from './plan.component';
import { PlanListComponent } from './plan.list.component';
import { PlanDetailComponent } from './plan.detail.component';

export const learnRoutes: Routes = [
    {
        path: 'learn',
        component: LearnComponent,
        children: [
            {
                path: 'category',
                component: CategoryListComponent
            },
            {
                path: 'object',
                component: ObjectComponent,
                children: [
                    { path: '', redirectTo: 'list', pathMatch: 'full' },
                    {
                        path: 'list',
                        component: ObjectListComponent,
                    },
                    {
                        path: 'create',
                        component: ObjectDetailComponent,
                        data: {
                            uimode: 1
                        }
                    },
                    {
                        path: 'change/:id',
                        component: ObjectDetailComponent,
                        data: {
                            uimode: 2
                        }
                    },
                    {
                        path: 'display/:id',
                        component: ObjectDetailComponent,
                        data: {
                            uimode: 3
                        }
                    }
                ]
            },
            {
                path: 'history',
                component: HistoryComponent,
                children: [
                    { path: '', redirectTo: 'list', pathMatch: 'full' },
                    {
                        path: 'list',
                        component: HistoryListComponent,
                    },
                    {
                        path: 'create',
                        component: HistoryDetailComponent
                    },
                    {
                        path: 'change/:id',
                        component: HistoryDetailComponent
                    },
                    {
                        path: 'display/:id',
                        component: HistoryDetailComponent
                    }
                ]
            },
            {
                path: 'award',
                component: AwardComponent,
                children: [
                    { path: '', redirectTo: 'list', pathMatch: 'full' },
                    {
                        path: 'list',
                        component: AwardListComponent,
                    },
                    {
                        path: 'create',
                        component: AwardDetailComponent
                    },
                    {
                        path: 'change/:id',
                        component: AwardDetailComponent
                    },
                    {
                        path: 'display/:id',
                        component: AwardDetailComponent
                    }
                ]
            },
            {
                path: 'plan',
                component: PlanComponent,
                children: [
                    { path: '', redirectTo: 'list', pathMatch: 'full' },
                    {
                        path: 'list',
                        component: PlanListComponent,
                    },
                    {
                        path: 'create',
                        component: PlanDetailComponent
                    },
                    {
                        path: 'change/:id',
                        component: PlanDetailComponent
                    },
                    {
                        path: 'display/:id',
                        component: PlanDetailComponent
                    }
                ]
            }
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
