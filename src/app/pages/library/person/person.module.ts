import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PersonRoutingModule } from './person-routing.module';
import { PersonListComponent } from './person-list';
import { PersonDetailComponent } from './person-detail';
import { LibraryUIModule } from '../library-ui.module';
import { TranslocoModule } from '@ngneat/transloco';

@NgModule({
  declarations: [
    PersonListComponent,
    PersonDetailComponent
  ],
  imports: [
    CommonModule,
    LibraryUIModule,
    TranslocoModule,
    PersonRoutingModule
  ]
})
export class PersonModule { }
