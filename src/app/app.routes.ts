import { Routes } from '@angular/router';
import { AuthGuardService, HomeChoseGuardService, CanDeactivateGuardService } from './services';

import { PageInitialComponent } from './page-initial';
import { FinanceCurrencyComponent } from './finance-currency';
import { LanguageComponent } from './language';
import { HomeDefComponent } from './home-def';
import { HomeDefListComponent } from './home-def-list';
import { HomeDefDetailComponent } from './home-def-detail';
import { PageNotFoundComponent } from './page-not-found';

export const AppRoutes: Routes = [
    {
        path: '',
        redirectTo: '/initial',
        pathMatch: 'full',
    },
    { path: 'initial', component: PageInitialComponent },
    { path: 'language', component: LanguageComponent },
    {
        path: 'homedef',
        component: HomeDefComponent,
        canActivate: [AuthGuardService],
        children: [
            {
                path: '',
                component: HomeDefListComponent,
            },
            {
                path: 'create',
                component: HomeDefDetailComponent,
              },
              {
                path: 'display/:id',
                component: HomeDefDetailComponent,
              },
              {
                path: 'edit/:id',
                component: HomeDefDetailComponent,
              },
        ],
    },
    { path: 'currency', component: FinanceCurrencyComponent, canActivate: [AuthGuardService], },
    {
        path: 'learn',
        canActivate: [HomeChoseGuardService],
        loadChildren: 'app/learn/learn.module#LearnModule',
    },
    {
        path: 'finance',
        canActivate: [HomeChoseGuardService],
        loadChildren: 'app/finance/finance.module#FinanceModule',
    },
    { path: '**', component: PageNotFoundComponent },
];
