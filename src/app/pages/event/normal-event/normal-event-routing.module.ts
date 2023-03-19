import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NormalEventDetailComponent } from "./normal-event-detail";
import { NormalEventListComponent } from "./normal-event-list";

const routes: Routes = [
  { path: "", component: NormalEventListComponent },
  { path: "list", component: NormalEventListComponent },
  { path: "create", component: NormalEventDetailComponent },
  { path: "display/:id", component: NormalEventDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NormalEventRoutingModule {}
