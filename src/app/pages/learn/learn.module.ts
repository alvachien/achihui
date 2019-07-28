import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LearnRoutingModule } from './learn-routing.module';
import { LearnComponent } from '../learn/learn.component';


@NgModule({
  declarations: [LearnComponent],
  imports: [
    CommonModule,
    LearnRoutingModule
  ]
})
export class LearnModule { }
