import { Routes } from '@angular/router';
import { AuthGuardService, HomeChoseGuardService, CanDeactivateGuardService } from './services';

import { PageInitialComponent } from './page-initial';
import { FinanceCurrencyComponent } from './finance-currency';
import { LanguageComponent } from './language';
import { HomeDefComponent } from './home-def';
import { HomeDefListComponent } from './home-def-list';
import { HomeDefDetailComponent } from './home-def-detail';
import { HomeMessageComponent } from './home-message';
import { PageNotFoundComponent } from './page-not-found';
import { PageLackAuthorityComponent } from './page-lack-authority';
import { TagsListComponent } from './tags-list';
import { AboutComponent } from './about';
import { CreditsComponent } from './credits';
import { VersionComponent } from './version';
import { UserDetailComponent } from './user-detail';
import { PageFatalErrorComponent } from './page-fatal-error';

export const appRoutes: Routes = [{
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
{ path: 'homemsg', component: HomeMessageComponent, canActivate: [HomeChoseGuardService], },
{ path: 'tag', component: TagsListComponent, canActivate: [AuthGuardService], },
{
  path: 'learn',
  canActivate: [HomeChoseGuardService],
  // loadChildren: 'app/learn/learn.module#LearnModule',
  loadChildren: () => import('./learn/learn.module').then(m => m.LearnModule)
},
{
  path: 'finance',
  canActivate: [HomeChoseGuardService],
  // loadChildren: 'app/finance/finance.module#FinanceModule',
  loadChildren: () => import('./finance/finance.module').then(m => m.FinanceModule)
},
{
  path: 'event',
  canActivate: [HomeChoseGuardService],
  // loadChildren: 'app/event/event.module#EventModule',
  loadChildren: () => import('./event/event.module').then(m => m.EventModule)
},
{
  path: 'library',
  canActivate: [HomeChoseGuardService],
  // loadChildren: 'app/library/library.module#LibraryModule',
  loadChildren: () => import('./library/library.module').then(m => m.LibraryModule)
},
{ path: 'about', component: AboutComponent },
{ path: 'credits', component: CreditsComponent },
{ path: 'userdetail', component: UserDetailComponent, canActivate: [AuthGuardService], },
{ path: 'version', component: VersionComponent },
{ path: 'lackauthority', component: PageLackAuthorityComponent },
{ path: 'fatalerror', component: PageFatalErrorComponent },
{ path: '**', component: PageNotFoundComponent },
];
