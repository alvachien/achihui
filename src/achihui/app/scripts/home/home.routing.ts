import { Routes }                   from '@angular/router';
import { HomeComponent }            from './home.component';
import { LanguageComponent }        from './language.component';
import { ModuleComponent }          from './module.component';
import { UserDetailComponent }      from './user.detail.component';
import { UserHistoryComponent }     from './user.history.component';

export const homeRoutes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'language', component: LanguageComponent },
    { path: 'module', component: ModuleComponent },
    { path: 'userdetail', component: UserDetailComponent },
    { path: 'userhist', component: UserHistoryComponent },
];

