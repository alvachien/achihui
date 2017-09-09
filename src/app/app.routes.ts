import { Routes } from '@angular/router';
import { AuthGuardService, HomeChoseGuardService, CanDeactivateGuardService } from './services';

import { PageInitialComponent } from './page-initial';
import { PageHomeListComponent } from './page-home-list';
import { PageHomeDetailComponent } from './page-home-detail';
import { LearnObjectCategoryComponent } from './learn-object-category';
import { LearnObjectComponent } from './learn-object';
import { LearnHistoryComponent } from './learn-history';
import { FinanceAccountCategoryComponent } from './finance-account-category';
import { FinanceDocumentTypeComponent } from './finance-document-type';
import { FinanceTranTypeComponent } from './finance-tran-type';
import { FinanceAccountComponent } from './finance-account';
import { FinanceCurrencyComponent } from './finance-currency';
import { FinanceControlCenterComponent } from './finance-control-center';
import { FinanceOrderComponent } from './finance-order';
import { FinanceDocumentComponent } from './finance-document';

export const AppRoutes: Routes = [
    { path: '', component: PageInitialComponent },
    { path: 'homelist', component: PageHomeListComponent, canActivate: [AuthGuardService], },
    { path: 'currency', component: FinanceCurrencyComponent, canActivate: [AuthGuardService], },
    { path: 'homedetail', component: PageHomeDetailComponent, canActivate: [AuthGuardService], canDeactivate: [CanDeactivateGuardService] },
    
    { path: 'learn-obj-ctgy', component: LearnObjectCategoryComponent, canActivate: [HomeChoseGuardService], canDeactivate: [CanDeactivateGuardService] },
];
