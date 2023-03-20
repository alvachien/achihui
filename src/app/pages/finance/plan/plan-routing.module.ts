import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { PlanListComponent } from "./plan-list/plan-list.component";
import { PlanDetailComponent } from "./plan-detail/plan-detail.component";

const routes: Routes = [
  { path: "", component: PlanListComponent },
  { path: "list", component: PlanListComponent },
  { path: "create", component: PlanDetailComponent },
  { path: "display/:id", component: PlanDetailComponent },
  { path: "edit/:id", component: PlanDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlanRoutingModule {}
