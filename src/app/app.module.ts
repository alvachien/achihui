import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgZorroAntdModule, NZ_I18N, en_US, } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import zh from '@angular/common/locales/zh';
import { TranslocoModule, translocoConfig, TRANSLOCO_CONFIG } from '@ngneat/transloco';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IconsProviderModule } from './icons-provider.module';
import { AuthService, AuthGuardService,
  FinCurrencyService, HomeChoseGuardService,
  CanDeactivateGuardService, LanguageService, UIStatusService, SideNavService, TagsService,
  FinanceOdataService,
  HomeDefOdataService,
} from './services';
import { environment } from '../environments/environment';
import { translocoLoader } from './transloco-loader';

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    IconsProviderModule,
    NgZorroAntdModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    HttpClientModule,
    TranslocoModule,
  ],
  providers: [
    { provide: NZ_I18N, useValue: en_US },
    AuthService,
    AuthGuardService,
    FinCurrencyService,
    HomeChoseGuardService,
    CanDeactivateGuardService,
    LanguageService,
    UIStatusService,
    SideNavService,
    HomeDefOdataService,
    FinanceOdataService,
    {
      provide: TRANSLOCO_CONFIG,
      useValue: translocoConfig({
        availableLangs: ['en', 'zh'],
        defaultLang: 'en',
        reRenderOnLangChange: true,
        prodMode: environment.production,
      })
    },
    translocoLoader,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
