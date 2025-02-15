import { Routes } from '@angular/router';
import { AuthGuardService, HomeChoseGuardService } from './services';

const routeConfig: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/welcome' },
  {
    path: 'welcome',
    loadComponent: () => import('./pages/welcome/').then(c => c.WelcomeComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/').then((m) => m.AboutComponent),
  },
  {
    path: 'version',
    loadComponent: () => import('./pages/version/').then((m) => m.VersionComponent),
  },
  {
    path: 'credits',
    loadComponent: () => import('./pages/credits/').then((m) => m.CreditsComponent),
  },
  {
    path: 'languages',
    loadComponent: () => import('./pages/language/').then((m) => m.LanguageComponent),
  },
  {
    path: 'userdetail',
    loadComponent: () => import('./pages/user-detail/').then((m) => m.UserDetailComponent),
  },

  {
    path: 'homedef',
    canActivate: [AuthGuardService],
    loadChildren: () => import('./pages/home-def/home-def.routes').then(m => m.HOMEDEF_ROUTES)
  },

  {
    path: 'finance',
    canActivate: [HomeChoseGuardService],
    loadChildren: () => import('./pages/finance/finance.routes').then(m => m.FINANCE_ROUTES)
  },

  {
    path: 'library',
    canActivate: [HomeChoseGuardService],
    loadChildren: () => import('./pages/library/library.routes').then(m => m.LIBRARY_ROUTES)
  },

  {
    path: 'event',
    canActivate: [HomeChoseGuardService],
    loadChildren: () => import('./pages/event/event.routes').then(m => m.EVENT_ROUTES)
  },

  {
    path: 'blog',
    canActivate: [AuthGuardService],
    loadChildren: () => import('./pages/blog/blog.routes').then(m => m.BLOG_ROUTES)
  },

  {
    path: 'fatalerror',
    loadComponent: () => import('./pages/fatal-error/').then((m) => m.FatalErrorComponent),
  },

  {
    path: 'lackauthority',
    loadComponent: () => import('./pages/lack-authority/').then((m) => m.LackAuthorityComponent),
  },

  {
    path: '**',
    loadComponent: () => import('./pages/not-found/').then((m) => m.NotFoundComponent),
  },
];

export default routeConfig;
