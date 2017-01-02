import { BrowserModule }        from '@angular/platform-browser';
import { NgModule }             from '@angular/core';
import { FormsModule }          from '@angular/forms';
import { MaterialModule }       from '@angular/material';
import { Routes, RouterModule } from '@angular/router';
import { HttpModule, Http }     from '@angular/http';
import { FlexLayoutModule }     from '@angular/flex-layout';
// import { CovalentCoreModule }   from '@covalent/core';
// import { CovalentDataTableModule } from '@covalent/data-table';
import 'hammerjs';

import { AppComponent }         from './app.component';
import { HomeComponent }        from './home/home.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { AboutComponent }       from './about/about.component';

const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: '**', component: PagenotfoundComponent }
];

@NgModule({
  imports: [
    MaterialModule.forRoot(),
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    FormsModule,
    HttpModule,
    FlexLayoutModule.forRoot(),
    // CovalentCoreModule.forRoot(),
    // CovalentDataTableModule.forRoot()
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    PagenotfoundComponent,
    AboutComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
