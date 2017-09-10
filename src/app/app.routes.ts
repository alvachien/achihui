import { Routes } from '@angular/router';
import { AuthGuardService, HomeChoseGuardService, CanDeactivateGuardService } from './services';

import { PageInitialComponent } from './page-initial';
import { PageHomeListComponent } from './page-home-list';
import { PageHomeDetailComponent } from './page-home-detail';
import { FinanceCurrencyComponent } from './finance-currency';
import { LanguageComponent } from './language';

export const AppRoutes: Routes = [
    { path: '', component: PageInitialComponent },
    { path: 'language', component: LanguageComponent },
    { path: 'homelist', component: PageHomeListComponent, canActivate: [AuthGuardService], },
    { path: 'currency', component: FinanceCurrencyComponent, canActivate: [AuthGuardService], },    
    { path: 'homedetail', component: PageHomeDetailComponent, canActivate: [AuthGuardService], canDeactivate: [CanDeactivateGuardService] },
    // {
    //     path: '',
    //     redirectTo: '/home',
    //     pathMatch: 'full'
    // },
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
    //{ path: '**', component: PagenotfoundComponent },
];
