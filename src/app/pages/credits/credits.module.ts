import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@ngneat/transloco';

import { CreditsRoutingModule } from './credits-routing.module';
import { CreditsComponent } from './credits.component';

@NgModule({
  declarations: [CreditsComponent],
  imports: [
    CommonModule,
    TranslocoModule,
    CreditsRoutingModule
  ]
})
export class CreditsModule { }
