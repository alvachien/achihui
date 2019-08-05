import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzBackTopModule } from 'ng-zorro-antd/back-top';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { VersionRoutingModule } from './version-routing.module';
import { VersionComponent } from './version.component';

@NgModule({
  declarations: [VersionComponent],
  imports: [
    CommonModule,
    NzTimelineModule,
    NzBackTopModule,
    NzIconModule,
    VersionRoutingModule
  ]
})
export class VersionModule { }
