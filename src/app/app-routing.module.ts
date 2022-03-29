import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuardService, HomeChoseGuardService, CanDeactivateGuardService } from './services';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/welcome' },
  { path: 'welcome', loadChildren: () => import('./pages/welcome/welcome.module').then(m => m.WelcomeModule) },
  { path: 'about', loadChildren: () => import('./pages/about/about.module').then(m => m.AboutModule) },
  { path: 'version', loadChildren: () => import('./pages/version/version.module').then(m => m.VersionModule) },
  { path: 'credits', loadChildren: () => import('./pages/credits/credits.module').then(m => m.CreditsModule) },
  { path: 'languages', loadChildren: () => import('./pages/language/language.module').then(m => m.LanguageModule) },
  { path: 'userdetail', loadChildren: () => import('./pages/user-detail/user-detail.module').then(m => m.UserDetailModule) },

  {
    path: 'homedef',
    canActivate: [AuthGuardService],
    loadChildren: () => import('./pages/home-def/home-def.module').then(m => m.HomeDefModule)
  },

  {
    path: 'finance',
    canActivate: [HomeChoseGuardService],
    loadChildren: () => import('./pages/finance/finance.module').then(m => m.FinanceModule)
  },

  {
    path: 'blog',
    canActivate: [AuthGuardService],
    loadChildren: () => import('./pages/blog/blog.module').then(m => m.BlogModule)
  },

  { path: 'fatalerror', loadChildren: () => import('./pages/fatal-error/fatal-error.module').then(m => m.FatalErrorModule) },

  {
    path: 'lackauthority',
    loadChildren: () => import('./pages/lack-authority/lack-authority.module').then(m => m.LackAuthorityModule)
  },

  { path: '**', loadChildren: () => import('./pages/not-found/not-found.module').then(m => m.NotFoundModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
