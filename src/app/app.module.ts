import { NgModule, Type } from '@angular/core';
import { BrowserModule, Title }  from '@angular/platform-browser';

import { CovalentCoreModule } from '@covalent/core';
import { CovalentHttpModule, IHttpInterceptor } from '@covalent/http';
import { CovalentHighlightModule } from '@covalent/highlight';
import { CovalentMarkdownModule } from '@covalent/markdown';
import { CovalentChartsModule } from '@covalent/charts';

import { FormsModule } from '@angular/forms';
import { MaterialModule } from '@angular/material';
import { Routes, RouterModule } from '@angular/router';
import { HttpModule, Http } from '@angular/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import 'hammerjs';
import {
  TranslateModule, TranslateLoader,
  TranslateStaticLoader
} from "ng2-translate";

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { AboutComponent } from './about/about.component';
import { UserdetailComponent } from './userdetail/userdetail.component';
import { AuthService } from './services/auth.service';
import { AppRoutingModule } from './app-routing.module';

export function funcHttpFactory(http: Http) {
  return new TranslateStaticLoader(http, '/assets/locales/', '.json');
}

@NgModule({
  imports: [
    MaterialModule.forRoot(),
    BrowserModule,
    FormsModule,
    HttpModule,
    FlexLayoutModule.forRoot(),
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: funcHttpFactory,
      deps: [Http]
    }),
    AppRoutingModule,
    CovalentCoreModule.forRoot(),
    CovalentChartsModule.forRoot(),
    CovalentHighlightModule.forRoot(),
    CovalentMarkdownModule.forRoot(),
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    PagenotfoundComponent,
    AboutComponent,
    UserdetailComponent
  ],
  providers: [
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
