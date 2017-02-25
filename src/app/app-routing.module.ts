import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { UserdetailComponent } from './userdetail/userdetail.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { AboutComponent } from './about/about.component';

import { CanDeactivateGuard } from './services/can-deactivate-guard.service';
import { AuthGuard } from './services/auth-guard.service';
import { PreloadSelectedModules } from './services/selective-preload-strategy';

const appRoutes: Routes = [
  { path: 'home', component: HomeComponent },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'learn',
    loadChildren: 'app/learn/learn.module#LearnModule',
  },
  {
    path: 'finance',
    loadChildren: 'app/finance/finance.module#FinanceModule',
  },
  {
    path: 'userdetail',
    component: UserdetailComponent
  },
  {
    path: 'about',
    component: AboutComponent
  },
  { path: '**', component: PagenotfoundComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes
    )
  ],
  exports: [
    RouterModule
  ],
  providers: [
    CanDeactivateGuard,
    PreloadSelectedModules
  ]
})
export class AppRoutingModule { }
