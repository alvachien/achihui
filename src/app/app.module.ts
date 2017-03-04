import { NgModule, Type } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';

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

import { UIRefModule } from './uiref.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { AboutComponent } from './about/about.component';
import { UserdetailComponent } from './userdetail/userdetail.component';
import { AuthService } from './services/auth.service';
import { UIStatusService } from './services/uistatus.service';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  imports: [
    MaterialModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    UIRefModule,
    FlexLayoutModule.forRoot(),
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
    AuthService,
    UIStatusService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
