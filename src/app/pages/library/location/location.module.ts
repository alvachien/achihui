import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LocationRoutingModule } from './location-routing.module';
import { LocationListComponent } from './location-list';
import { LocationDetailComponent } from './location-detail';
import { LibraryUIModule } from '../library-ui.module';
import { TranslocoModule } from '@ngneat/transloco';

@NgModule({
  declarations: [
    LocationListComponent,
    LocationDetailComponent
  ],
  imports: [
    CommonModule,
    LibraryUIModule,
    TranslocoModule,
    LocationRoutingModule
  ]
})
export class LocationModule { }
