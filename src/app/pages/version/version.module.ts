import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzBackTopModule } from 'ng-zorro-antd/back-top';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TranslocoModule } from '@ngneat/transloco';

import { VersionRoutingModule } from './version-routing.module';
import { VersionComponent } from './version.component';

@NgModule({
  declarations: [
    VersionComponent
  ],
  imports: [
    CommonModule,
    NzTimelineModule,
    NzBackTopModule,
    NzIconModule,
    TranslocoModule,
    VersionRoutingModule
  ]
})
export class VersionModule { }
