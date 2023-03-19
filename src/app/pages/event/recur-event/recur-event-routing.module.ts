import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { RecurEventDetailComponent } from "./recur-event-detail";
import { RecurEventListComponent } from "./recur-event-list";

const routes: Routes = [
  { path: "", component: RecurEventListComponent },
  { path: "list", component: RecurEventListComponent },
  { path: "create", component: RecurEventDetailComponent },
  { path: "display/:id", component: RecurEventDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecurEventRoutingModule {}
