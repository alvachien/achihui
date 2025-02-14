import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import zh from '@angular/common/locales/zh';
import { TranslocoModule, translocoConfig, TRANSLOCO_CONFIG } from '@ngneat/transloco';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { en_US, zh_CN, NZ_I18N } from 'ng-zorro-antd/i18n';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IconsProviderModule } from './icons-provider.module';
import {
  AuthService,
  AuthGuardService,
  HomeChoseGuardService,
  BlogOdataService,
  CanDeactivateGuardService,
  UIStatusService,
  FinanceOdataService,
  HomeDefOdataService,
  LanguageOdataService,
} from './services';
import { environment } from '../environments/environment';
import { translocoLoader } from './transloco-loader';
import { MessageDialogComponent } from './pages/message-dialog';
import { AppInitializerProvider } from './app-initializer.service';
import { AuthConfigModule } from './auth/auth-config.module';

registerLocaleData(zh);
registerLocaleData(en);

@NgModule({ declarations: [AppComponent, MessageDialogComponent],
    bootstrap: [AppComponent], imports: [
        BrowserModule,
        AppRoutingModule,
        IconsProviderModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        TranslocoModule,
        NzLayoutModule,
        NzMenuModule,
        NzIconModule,
        NzInputModule,
        NzDropDownModule,
        NzTableModule,
        NzModalModule,
        NgxEchartsModule.forRoot({
            echarts,
        }),
        MarkdownModule.forRoot({
            markedOptions: {
                provide: MarkedOptions,
                useValue: {
                    gfm: true,
                    breaks: true,
                    pedantic: false,
                    smartLists: true,
                    smartypants: false,
                },
            },
        }),
        AuthConfigModule], providers: [
        //{ provide: NZ_I18N, useValue: en_US },
        AppInitializerProvider,
        {
            provide: NZ_I18N,
            useFactory: (localId: string) => {
                switch (localId) {
                    case 'en':
                        return en_US;
                    /** 与 angular.json i18n/locales 配置一致 **/
                    case 'zh':
                        return zh_CN;
                    default:
                        return en_US;
                }
            },
            deps: [LOCALE_ID],
        },
        AuthService,
        AuthGuardService,
        HomeChoseGuardService,
        CanDeactivateGuardService,
        UIStatusService,
        LanguageOdataService,
        HomeDefOdataService,
        FinanceOdataService,
        NzModalService,
        BlogOdataService,
        {
            provide: TRANSLOCO_CONFIG,
            useValue: translocoConfig({
                availableLangs: ['en', 'zh'],
                defaultLang: environment.DefaultLanguage ? environment.DefaultLanguage : 'en',
                reRenderOnLangChange: true,
                prodMode: environment.production,
            }),
        },
        translocoLoader,
        provideHttpClient(withInterceptorsFromDi()),
    ] })
export class AppModule {}
