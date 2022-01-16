import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzImageModule } from 'ng-zorro-antd/image';
import { TranslocoModule } from '@ngneat/transloco';

import { WelcomeRoutingModule } from './welcome-routing.module';
import { WelcomeComponent } from './welcome.component';

@NgModule({
  imports: [
    CommonModule,
    NzGridModule,
    NzDividerModule,
    NzTypographyModule,
    NzCardModule,
    NzImageModule,
    TranslocoModule,
    WelcomeRoutingModule,
  ],
  declarations: [
    WelcomeComponent,
  ],
  exports: [
    WelcomeComponent,
  ],
})
export class WelcomeModule { }
