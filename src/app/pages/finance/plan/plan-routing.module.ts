import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlanComponent } from './plan.component';
import { PlanListComponent } from './plan-list/plan-list.component';
import { PlanDetailComponent } from './plan-detail/plan-detail.component';

const routes: Routes = [
  { path: '', component: PlanComponent },
  { path: 'list', component: PlanListComponent },
  { path: 'create', component: PlanDetailComponent },
  { path: 'display', component: PlanDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlanRoutingModule { }
