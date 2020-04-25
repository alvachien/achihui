import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NZ_I18N, en_US, NzModalService, NzModalConfirmContainerComponent, NzModalModule, } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
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
import { MarkdownModule } from 'ngx-markdown';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IconsProviderModule } from './icons-provider.module';
import { AuthService, AuthGuardService,
  HomeChoseGuardService, LearnOdataService, BlogOdataService,
  CanDeactivateGuardService, UIStatusService, TagsService,
  FinanceOdataService, HomeDefOdataService, LanguageOdataService,
} from './services';
import { environment } from '../environments/environment';
import { translocoLoader } from './transloco-loader';
import { MessageDialogComponent } from './pages/message-dialog';

registerLocaleData(zh);
registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    MessageDialogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    IconsProviderModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    HttpClientModule,
    TranslocoModule,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzInputModule,
    NzDropDownModule,
    NzTableModule,
    NzModalModule,
    MarkdownModule.forRoot(),
  ],
  providers: [
    { provide: NZ_I18N, useValue: en_US },
    AuthService,
    AuthGuardService,
    HomeChoseGuardService,
    CanDeactivateGuardService,
    UIStatusService,
    LanguageOdataService,
    HomeDefOdataService,
    LearnOdataService,
    FinanceOdataService,
    NzModalService,
    BlogOdataService,
    {
      provide: TRANSLOCO_CONFIG,
      useValue: translocoConfig({
        availableLangs: ['en', 'zh'],
        defaultLang: environment.DefaultLanguage? environment.DefaultLanguage : 'en',
        reRenderOnLangChange: true,
        prodMode: environment.production,
      })
    },
    translocoLoader,
  ],
  entryComponents: [
    NzModalConfirmContainerComponent,
    MessageDialogComponent,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
