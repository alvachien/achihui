import { ApplicationRef, NgModule, Type } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule, Title } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';
import { STEPPER_GLOBAL_OPTIONS, }  from '@angular/cdk/stepper';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_LOCALE_PROVIDER, MatPaginatorIntl,
  } from '@angular/material';
import { UIDependModule } from './uidepend.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppComponent } from './app.component';
import { AuthService, AuthGuardService,
  FinCurrencyService, HomeChoseGuardService, FinanceStorageService, LearnStorageService, LibraryStorageService,
  HomeDefDetailService, CanDeactivateGuardService, LanguageService, UIStatusService, SideNavService, TagsService,
  EventStorageService,
} from './services';
import { appRoutes } from './app.routes';
import { PageInitialComponent } from './page-initial';
import { LearnModule } from './learn';
import { FinanceModule } from './finance';
import { FinanceCurrencyComponent } from './finance-currency';
import { LanguageComponent } from './language';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MessageDialogComponent } from './message-dialog/message-dialog.component';
import { HomeDefComponent } from './home-def';
import { HomeDefListComponent } from './home-def-list';
import { HomeDefDetailComponent } from './home-def-detail';
import { PageNotFoundComponent } from './page-not-found';
import { PageLackAuthorityComponent } from './page-lack-authority';
import { SideNavComponent } from './side-nav';
import { SideNavItemComponent } from './side-nav-item';
import { TagsListComponent } from './tags-list';
import { AboutComponent } from './about';
import { CreditsComponent } from './credits';
import { VersionComponent } from './version';
import { HomeMessageComponent, HomeMessageDialogComponent } from './home-message';
// import { MatPaginatorIntlCN  } from './utility';
import { ThemePickerModule, ThemeStorage } from './theme-picker';
import { FooterComponent } from './footer';
import { HomeDashboardComponent } from './home-dashboard';
import { UserDetailComponent } from './user-detail';
import { PageFatalErrorComponent } from './page-fatal-error';
import { environment } from '../environments/environment';

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/locales/', '.json');
}

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    RouterModule.forRoot(appRoutes),
    ReactiveFormsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    UIDependModule,
    ThemePickerModule,
  ],
  declarations: [
    AppComponent,
    PageInitialComponent,
    FinanceCurrencyComponent,
    LanguageComponent,
    MessageDialogComponent,
    HomeDefComponent,
    HomeDefListComponent,
    HomeDefDetailComponent,
    PageNotFoundComponent,
    SideNavComponent,
    SideNavItemComponent,
    TagsListComponent,
    AboutComponent,
    CreditsComponent,
    VersionComponent,
    HomeMessageComponent,
    HomeMessageDialogComponent,
    PageLackAuthorityComponent,
    FooterComponent,
    HomeDashboardComponent,
    UserDetailComponent,
    PageFatalErrorComponent,
  ],
  entryComponents: [
    MessageDialogComponent,
    HomeMessageDialogComponent,
  ],
  providers: [
    MAT_DATE_LOCALE_PROVIDER,

    { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    },
    // { provide: MatPaginatorIntl, useClass: MatPaginatorIntlCN },
    AuthService,
    AuthGuardService,
    FinCurrencyService,
    HomeChoseGuardService,
    HomeDefDetailService,
    CanDeactivateGuardService,
    FinanceStorageService,
    LearnStorageService,
    LibraryStorageService,
    LanguageService,
    UIStatusService,
    SideNavService,
    TagsService,
    EventStorageService,
    ThemeStorage,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
