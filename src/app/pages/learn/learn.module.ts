import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LearnUIModule } from './learn-ui.module';
import { TranslocoModule } from '@ngneat/transloco';

import { LearnRoutingModule } from './learn-routing.module';
import { LearnComponent } from '../learn/learn.component';

@NgModule({
  declarations: [
    LearnComponent
  ],
  imports: [
    CommonModule,
    LearnUIModule,
    TranslocoModule,
    LearnRoutingModule
  ]
})
export class LearnModule { }
