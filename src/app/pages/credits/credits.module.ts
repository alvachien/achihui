import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@ngneat/transloco';
import { NzListModule } from 'ng-zorro-antd/list';

import { CreditsRoutingModule } from './credits-routing.module';
import { CreditsComponent } from './credits.component';

@NgModule({
  declarations: [CreditsComponent],
  imports: [CommonModule, TranslocoModule, NzListModule, CreditsRoutingModule],
})
export class CreditsModule {}
