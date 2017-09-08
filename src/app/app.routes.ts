import { Routes } from '@angular/router';

import { PageInitialComponent } from './page-initial';
import { PageHomeListComponent } from './page-home-list';
import { PageHomeDetailComponent } from './page-home-detail';

export const AppRoutes: Routes = [
    { path: '', component: PageInitialComponent },
    { path: 'homelist', component: PageHomeListComponent },
    { path: 'homedetail', component: PageHomeListComponent },
];
