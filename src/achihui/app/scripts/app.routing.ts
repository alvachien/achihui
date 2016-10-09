import { Routes, RouterModule } from '@angular/router';
import { learnRoutes } from './learn/learn.routing';
import { financeRoutes } from './finance/finance.routing';
import { homeRoutes } from './home/home.routing';
import { aboutRoutes } from './about/about.routing';
import { forbiddenRoutes } from './forbidden/forbidden.routing';
import { unauthorizedRoutes } from './unauthorized/unauthorized.routing';

const mainRoutes: Routes = [
    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
    },
    {
        path: 'learn',
        loadChildren: 'learn/learn.module#LearnModule'
    },
    {
        path: 'event',
        loadChildren: 'event/event.module#EventModule'
    },
    {
        path: 'finance',
        loadChildren: 'finance/finance.module#FinanceModule'
    }
];

const appRoutes: Routes = [
    ...mainRoutes,
    ...homeRoutes,
    ...aboutRoutes,
    ...forbiddenRoutes,
    ...unauthorizedRoutes
];

export const appRoutingProviders: any[] = [
    //authProviders,
    //CanDeactivateGuard
];

export const routing = RouterModule.forRoot(appRoutes);
