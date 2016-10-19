import { NgModule }         from '@angular/core';
import { BrowserModule }    from '@angular/platform-browser';
import { FormsModule }      from '@angular/forms';
import { HttpModule, Http } from '@angular/http';
import { AppComponent }     from './app.component';
import {
    routing,
    appRoutingProviders
} from './app.routing';
import { Ng2BootstrapModule } from 'ng2-bootstrap/ng2-bootstrap';
import { TranslateModule, TranslateLoader, TranslateStaticLoader } from "ng2-translate/ng2-translate";

import { LearnModule }      from './learn/learn.module';
import { EventModule }      from './event/event.module';
import { FinanceModule }    from './finance/finance.module';

import { CreditsComponent } from './about/credits.component';
import { AboutComponent }   from './about/about.component';
import { ForbiddenComponent }       from './forbidden/forbidden.component';
import { UnauthorizedComponent }    from './unauthorized/unauthorized.component';

import { DialogService }    from './services/dialog.service';
import { BufferService }    from './services/buffer.service';
import { AuthService }      from './services/auth.service';
import { UtilService }      from './services/util.service';
import { HomeComponent }    from './home/home.component';
import { LanguageComponent } from './home/language.component';
import { ModuleComponent } from './home/module.component';
import { UserDetailComponent } from './home/user.detail.component';
import { UserHistoryComponent } from './home/user.history.component';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        routing,
        Ng2BootstrapModule,
        TranslateModule.forRoot({
            provide: TranslateLoader,
            useFactory: (http: Http) => new TranslateStaticLoader(http, '/app/locales/', '.json'),
            deps: [Http]
        }),
        EventModule,
        LearnModule,
        FinanceModule
    ],
    declarations: [
        AppComponent,
        CreditsComponent,
        AboutComponent,
        HomeComponent,
        LanguageComponent,
        ModuleComponent,
        UserDetailComponent,
        UserHistoryComponent,
        ForbiddenComponent,
        UnauthorizedComponent
    ],
    providers: [
        appRoutingProviders,
        DialogService,
        AuthService,
        BufferService,
        UtilService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
