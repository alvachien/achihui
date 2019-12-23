import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@ngneat/transloco';

import { LearnRoutingModule } from './learn-routing.module';
import { LearnComponent } from '../learn/learn.component';

@NgModule({
  declarations: [LearnComponent],
  imports: [
    CommonModule,
    TranslocoModule,
    LearnRoutingModule
  ]
})
export class LearnModule { }
