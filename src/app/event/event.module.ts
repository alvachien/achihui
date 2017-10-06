import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE_PROVIDER, MAT_DATE_LOCALE } from '@angular/material';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MATERIAL_COMPATIBILITY_MODE } from '@angular/material';

import { UIDependModule } from '../uidepend.module';
import { TranslateModule } from '@ngx-translate/core';
import { MD_MOMENT_DATE_FORMATS, MomentDateAdapter } from '../utility';

import { EventComponent } from './event.component';
import { CategoryComponent } from './category/category.component';
import { EventListComponent } from './event-list/event-list.component';
import { EventDetailComponent } from './event-detail/event-detail.component';
import { RecurrEventComponent } from './recurr-event/recurr-event.component';
import { RecurrEventDetailComponent } from './recurr-event-detail/recurr-event-detail.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    UIDependModule,
    TranslateModule.forChild(),
  ],
  declarations: [
    EventComponent, 
    CategoryComponent, 
    EventListComponent, 
    EventDetailComponent, 
    RecurrEventComponent, 
    RecurrEventDetailComponent
  ],
  providers: [
    MAT_DATE_LOCALE_PROVIDER,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MD_MOMENT_DATE_FORMATS },
    { provide: MATERIAL_COMPATIBILITY_MODE, useValue: true },
  ],
})
export class EventModule { }
