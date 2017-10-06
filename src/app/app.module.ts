import { ApplicationRef, NgModule, Type } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule, Title } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';
import { HttpModule, Http } from '@angular/http';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_LOCALE_PROVIDER } from '@angular/material';
import { UIDependModule } from './uidepend.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MATERIAL_COMPATIBILITY_MODE } from '@angular/material';

import { AppComponent } from './app.component';
import {
  AuthService, AuthGuardService,
  FinCurrencyService, HomeChoseGuardService, FinanceStorageService, LearnStorageService,
  HomeDefDetailService, CanDeactivateGuardService, LanguageService, UIStatusService, SideNavService
} from './services';
import { AppRoutes } from './app.routes';
import { PageInitialComponent } from './page-initial';
import { LearnModule } from './learn';
import { FinanceModule } from './finance';
import { FinanceCurrencyComponent } from './finance-currency';
import { LanguageComponent } from './language';
import { MD_MOMENT_DATE_FORMATS, MomentDateAdapter } from './utility';
import { MessageDialogComponent } from './message-dialog/message-dialog.component';
import { HomeDefComponent } from './home-def';
import { HomeDefListComponent } from './home-def-list';
import { HomeDefDetailComponent } from './home-def-detail';
import { PageNotFoundComponent } from './page-not-found';
import { SideNavComponent } from './side-nav';
import { SideNavItemComponent } from './side-nav-item';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/locales/', '.json');
}

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    RouterModule.forRoot(AppRoutes),
    ReactiveFormsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    HttpModule,
    UIDependModule,
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
  ],
  entryComponents: [
    MessageDialogComponent,
  ],
  providers: [
    MAT_DATE_LOCALE_PROVIDER,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MD_MOMENT_DATE_FORMATS },
    { provide: MATERIAL_COMPATIBILITY_MODE, useValue: true },
    AuthService,
    AuthGuardService,
    FinCurrencyService,
    HomeChoseGuardService,
    HomeDefDetailService,
    CanDeactivateGuardService,
    FinanceStorageService,
    LearnStorageService,
    LanguageService,
    UIStatusService,
    SideNavService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
