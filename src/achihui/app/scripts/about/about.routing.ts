import { Routes }           from '@angular/router';
import { AboutComponent }   from './about.component';
import { CreditsComponent } from './credits.component';

export const aboutRoutes: Routes = [
    { path: 'about', component: AboutComponent },
    { path: 'credits', component: CreditsComponent }
];

export const aboutProviders = [
    //AuthGuard,
    //AuthService
];
