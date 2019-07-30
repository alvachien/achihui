import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VersionRoutingModule } from './version-routing.module';
import { VersionComponent } from './version.component';

@NgModule({
  declarations: [VersionComponent],
  imports: [
    CommonModule,
    VersionRoutingModule
  ]
})
export class VersionModule { }
