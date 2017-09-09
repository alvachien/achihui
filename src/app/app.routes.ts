import { Routes } from '@angular/router';
import { AuthGuardService } from './services/auth-guard.service';
import { HomeChoseGuardService } from './services/home-chose-guard.service';

import { PageInitialComponent } from './page-initial';
import { PageHomeListComponent } from './page-home-list';
import { PageHomeDetailComponent } from './page-home-detail';

export const AppRoutes: Routes = [
    { path: '', component: PageInitialComponent },
    { path: 'homelist', component: PageHomeListComponent, canActivate: [AuthGuardService], },
    { path: 'homedetail', component: PageHomeDetailComponent, canActivate: [AuthGuardService], },
];
