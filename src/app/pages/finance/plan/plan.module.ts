import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlanRoutingModule } from './plan-routing.module';
import { PlanComponent } from './plan.component';
import { PlanListComponent } from './plan-list/plan-list.component';
import { PlanDetailComponent } from './plan-detail/plan-detail.component';


@NgModule({
  declarations: [PlanComponent, PlanListComponent, PlanDetailComponent],
  imports: [
    CommonModule,
    PlanRoutingModule
  ]
})
export class PlanModule { }
