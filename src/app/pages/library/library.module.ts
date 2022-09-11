import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LibraryRoutingModule } from './library-routing.module';
import { LibraryUIModule } from './library-ui.module';
import { TranslocoModule } from '@ngneat/transloco';
import { LibraryComponent } from './library.component';


@NgModule({
  declarations: [
    LibraryComponent
  ],
  imports: [
    CommonModule,
    LibraryUIModule,
    TranslocoModule,
    LibraryRoutingModule
  ]
})
export class LibraryModule { }
