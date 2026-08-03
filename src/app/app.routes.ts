import { Routes } from '@angular/router';
import { AuthGuardService, HomeChoseGuardService } from './services';

const routeConfig: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/welcome' },
  {
    path: 'welcome',
    canActivate: [AuthGuardService],
    loadComponent: () => import('./pages/welcome/').then((c) => c.WelcomeComponent),
  },
  {
    path: 'about',
    canActivate: [AuthGuardService],
    loadComponent: () => import('./pages/about/').then((m) => m.AboutComponent),
  },
  {
    path: 'version',
    canActivate: [AuthGuardService],
    loadComponent: () => import('./pages/version/').then((m) => m.VersionComponent),
  },
  {
    path: 'credits',
    canActivate: [AuthGuardService],
    loadComponent: () => import('./pages/credits/').then((m) => m.CreditsComponent),
  },
  {
    path: 'languages',
    canActivate: [AuthGuardService],
    loadComponent: () => import('./pages/language/').then((m) => m.LanguageComponent),
  },
  {
    path: 'userdetail',
    canActivate: [AuthGuardService],
    loadComponent: () => import('./pages/user-detail/').then((m) => m.UserDetailComponent),
  },

  {
    path: 'homedef',
    canActivate: [AuthGuardService],
    loadChildren: () => import('./pages/home-def/home-def.routes').then((m) => m.HOMEDEF_ROUTES),
  },

  {
    path: 'finance',
    canActivate: [HomeChoseGuardService],
    loadChildren: () => import('./pages/finance/finance.routes').then((m) => m.FINANCE_ROUTES),
  },

  {
    path: 'library',
    canActivate: [HomeChoseGuardService],
    loadChildren: () => import('./pages/library/library.routes').then((m) => m.LIBRARY_ROUTES),
  },

  // Event Trace temporarily shut down (2026-08-02) - menu entry and route removed.
  // /event/* now falls through to the NotFound (** ) route. DB content is preserved.
  // To re-enable: restore the event lazy-load route below and the Nav.EventTrace submenu in app.component.html.
  // {
  //   path: 'event',
  //   canActivate: [HomeChoseGuardService],
  //   loadChildren: () => import('./pages/event/event.routes').then((m) => m.EVENT_ROUTES),
  // },

  // Blog temporarily shut down (2026-08-02) - menu entry and route removed.
  // /blog/* now falls through to the NotFound (** ) route. DB content is preserved.
  // To re-enable: restore the blog lazy-load route below and the Nav.Blogs submenu in app.component.html.
  // {
  //   path: 'blog',
  //   canActivate: [AuthGuardService],
  //   loadChildren: () => import('./pages/blog/blog.routes').then((m) => m.BLOG_ROUTES),
  // },

  {
    path: 'fatalerror',
    loadComponent: () => import('./pages/fatal-error/').then((m) => m.FatalErrorComponent),
  },

  {
    path: 'signin-callback',
    loadComponent: () =>
      import('./pages/signin-callback/signin-callback.component').then((m) => m.SignInCallbackComponent),
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
