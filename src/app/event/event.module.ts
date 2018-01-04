import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE_PROVIDER, MAT_DATE_LOCALE } from '@angular/material';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { UIDependModule } from '../uidepend.module';
import { TranslateModule } from '@ngx-translate/core';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';

import { EventRoutingModule } from './event-routing.module';

import { EventComponent } from './event.component';
import { CategoryComponent } from './category';
import { CategoryListComponent } from './category-list';
import { EventListComponent } from './event-list';
import { EventDetailComponent } from './event-detail';
import { RecurrEventComponent } from './recurr-event';
import { RecurrEventDetailComponent } from './recurr-event-detail';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    EventRoutingModule,
    UIDependModule,
    TranslateModule.forChild(),
  ],
  declarations: [
    EventComponent, 
    CategoryComponent, 
    CategoryListComponent,
    EventListComponent, 
    EventDetailComponent, 
    RecurrEventComponent, 
    RecurrEventDetailComponent
  ],
  providers: [
    MAT_DATE_LOCALE_PROVIDER,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ],
})
export class EventModule { }
