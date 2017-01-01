import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule }       from '@angular/material';
import { Routes, RouterModule } from '@angular/router';
import { HttpModule, Http }     from '@angular/http';
import 'hammerjs';
import { CovalentCoreModule } from '@covalent/core';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    MaterialModule.forRoot(),
    BrowserModule,
    RouterModule.forRoot([
      {
        path: '',
        component: AppComponent
      }
    ]),
    FormsModule,
    HttpModule,
    CovalentCoreModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
